#!/usr/bin/env node

/**
 * Smart Validator — Intelligent rule-aware codebase validation engine.
 *
 * Auto-discovers .cursor/rules/*.mdc, docs/architecture/*.md, and
 * scripts/validate-architecture.js to build a dynamic check pipeline.
 *
 * Usage:
 *   node scripts/validate-rules.js                  Full validation
 *   node scripts/validate-rules.js --json           JSON output only
 *   node scripts/validate-rules.js --feature expenses
 *   node scripts/validate-rules.js --category architecture
 */

import fs from "fs";
import path from "path";

const SEVERITY = { CRITICAL: "critical", MAJOR: "major", MINOR: "minor", INFO: "info" };
const SEVERITY_WEIGHT = { critical: 20, major: 10, minor: 3, info: 1 };

const APP_ROOT = process.cwd();
const SRC = path.join(APP_ROOT, "src");
const FLAGS = parseFlags(process.argv.slice(2));

function parseFlags(args) {
  const flags = { json: false, feature: null, category: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--json") flags.json = true;
    if (args[i] === "--feature" && args[i + 1]) flags.feature = args[i + 1];
    if (args[i] === "--category" && args[i + 1]) flags.category = args[i + 1];
  }
  return flags;
}

function walkFiles(dir, exts = [".js", ".jsx"]) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results.push(...walkFiles(full, exts));
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function rel(filePath) {
  return path.relative(APP_ROOT, filePath).replace(/\\/g, "/");
}

function readSafe(filePath) {
  try { return fs.readFileSync(filePath, "utf8"); } catch { return null; }
}

function lineNumber(source, index) {
  return source.substring(0, index).split("\n").length;
}

// ── Rule Discovery ──────────────────────────────────────────────────

function discoverRules() {
  const rulesDir = path.join(APP_ROOT, ".cursor", "rules");
  if (!fs.existsSync(rulesDir)) return [];
  return fs.readdirSync(rulesDir)
    .filter((f) => f.endsWith(".mdc"))
    .map((f) => {
      const content = readSafe(path.join(rulesDir, f));
      const name = f.replace(".mdc", "");
      return { name, file: f, content };
    })
    .filter((r) => r.content);
}

function discoverArchDocs() {
  const archDir = path.join(APP_ROOT, "docs", "architecture");
  if (!fs.existsSync(archDir)) return [];
  return fs.readdirSync(archDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const content = readSafe(path.join(archDir, f));
      return { name: f.replace(".md", ""), file: f, content };
    })
    .filter((d) => d.content);
}

// ── Check Engine ────────────────────────────────────────────────────

const violations = [];

function addViolation(severity, category, ruleRef, filePath, line, message, fix) {
  violations.push({
    severity,
    category,
    ruleRef,
    file: filePath ? rel(filePath) : null,
    line: line || null,
    message,
    fix,
  });
}

// ── 1. Feature Folder Contract ──────────────────────────────────────

function checkFeatureFolders() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) {
    addViolation(SEVERITY.CRITICAL, "architecture", "architecture.mdc", null, null,
      "src/features/ directory does not exist", "Create src/features/ directory");
    return;
  }

  const required = ["pages", "components", "hooks"];
  const features = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const feature of features) {
    if (FLAGS.feature && feature !== FLAGS.feature) continue;
    const featurePath = path.join(featuresDir, feature);
    for (const sub of required) {
      if (!fs.existsSync(path.join(featurePath, sub))) {
        addViolation(SEVERITY.MAJOR, "architecture", "architecture.mdc — feature-folder-contract",
          featurePath, null,
          `Feature "${feature}" is missing required subdirectory: ${sub}/`,
          `Create src/features/${feature}/${sub}/ or document exemption`);
      }
    }

    if (/[A-Z]/.test(feature)) {
      addViolation(SEVERITY.MINOR, "architecture", "architecture.mdc — naming",
        featurePath, null,
        `Feature folder "${feature}" uses non-kebab-case naming`,
        `Rename to kebab-case: ${feature.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`);
    }
  }
}

// ── 2. Import Boundary Validation ───────────────────────────────────

function checkImportBoundaries() {
  const LAYER_NAMES = ["app", "features", "domain", "infrastructure", "redux", "layouts", "shared", "components"];
  const FORBIDDEN = {
    domain:         new Set(["features", "app", "layouts"]),
    infrastructure: new Set(["features", "app", "layouts", "redux"]),
    shared:         new Set(["features", "domain", "app", "layouts", "redux"]),
    components:     new Set(["features", "domain", "redux"]),
  };

  const exemptFile = path.join(APP_ROOT, "scripts", "validate-architecture.js");
  let exemptions = new Set();
  const exemptContent = readSafe(exemptFile);
  if (exemptContent) {
    const match = exemptContent.match(/TEMP_EXEMPTIONS\s*=\s*\[([\s\S]*?)\]/);
    if (match) {
      const paths = match[1].match(/"([^"]+)"/g);
      if (paths) exemptions = new Set(paths.map((p) => p.replace(/"/g, "")));
    }
  }

  const files = walkFiles(SRC);
  for (const filePath of files) {
    const relPath = rel(filePath);
    if (exemptions.has(relPath)) continue;

    const fromSrc = path.relative(SRC, filePath).replace(/\\/g, "/");
    const layer = fromSrc.split("/")[0];
    if (!FORBIDDEN[layer]) continue;

    const source = readSafe(filePath);
    if (!source) continue;

    const importRegex = /from\s+["'](@\/([^/"']+)[^"']*)["']/g;
    let m;
    while ((m = importRegex.exec(source))) {
      const importPath = m[1];
      const targetLayer = m[2];
      if (LAYER_NAMES.includes(targetLayer) && FORBIDDEN[layer].has(targetLayer)) {
        addViolation(SEVERITY.CRITICAL, "architecture", "BOUNDARIES.md — forbidden-import",
          filePath, lineNumber(source, m.index),
          `${layer}/ must not import from ${targetLayer}/ (${importPath})`,
          `Move the imported module to a layer that ${layer}/ is allowed to depend on (shared/, config/, etc.)`);
      }
    }
  }
}

// ── 3. Cross-Feature Deep Imports ───────────────────────────────────

function checkCrossFeatureImports() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  const files = walkFiles(featuresDir);
  for (const filePath of files) {
    const relPath = rel(filePath);
    const currentFeature = relPath.split("src/features/")[1]?.split("/")[0];
    if (!currentFeature) continue;
    if (FLAGS.feature && currentFeature !== FLAGS.feature) continue;

    const source = readSafe(filePath);
    if (!source) continue;

    const importRegex = /from\s+["']@\/features\/([^/"']+)(\/[^"']*)["']/g;
    let m;
    while ((m = importRegex.exec(source))) {
      const targetFeature = m[1];
      const deepPath = m[2];
      if (targetFeature === currentFeature) continue;

      const isBarrel = deepPath === "" || deepPath === "/" || /^\/[^/]+$/.test(deepPath);
      if (!isBarrel) {
        addViolation(SEVERITY.MAJOR, "architecture", "BOUNDARIES.md — cross-feature-deep-import",
          filePath, lineNumber(source, m.index),
          `Cross-feature deep import: ${currentFeature}/ imports ${targetFeature}${deepPath}`,
          `Expose via barrel (index.js) in features/${targetFeature}/ or move to shared/`);
      }
    }
  }
}

// ── 4. Raw HTML Elements in Features ────────────────────────────────

function checkRawHtmlElements() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  const patterns = [
    { regex: /<button[\s>]/g, element: "<button>", replacement: "<Button> from app-shadcn or <AppButton>" },
    { regex: /<select[\s>]/g, element: "<select>", replacement: "<Select> from app-shadcn or <AppSelect>" },
    { regex: /type=["']date["']/g, element: "native date input", replacement: "<ExpenseThemedDatePicker> or shadcn Calendar" },
  ];

  const files = walkFiles(featuresDir, [".jsx"]);
  for (const filePath of files) {
    if (FLAGS.feature) {
      const feature = rel(filePath).split("src/features/")[1]?.split("/")[0];
      if (feature !== FLAGS.feature) continue;
    }
    const source = readSafe(filePath);
    if (!source) continue;

    for (const { regex, element, replacement } of patterns) {
      let m;
      regex.lastIndex = 0;
      while ((m = regex.exec(source))) {
        addViolation(SEVERITY.MAJOR, "components", "components.mdc — shadcn-first",
          filePath, lineNumber(source, m.index),
          `Raw ${element} found in feature code`,
          `Replace with ${replacement}`);
      }
    }
  }
}

// ── 5. Clean Code Checks ────────────────────────────────────────────

function checkCleanCode() {
  const files = walkFiles(SRC);
  const checks = [
    { regex: /\bconsole\.log\b/g, msg: "console.log found", sev: SEVERITY.MAJOR, cat: "clean-code", ref: "global — no-console-log" },
    { regex: /\bdebugger\b/g, msg: "debugger statement found", sev: SEVERITY.MAJOR, cat: "clean-code", ref: "global — no-debugger" },
    { regex: /\/\/\s*(TODO|FIXME|HACK)\b/g, msg: "TODO/FIXME/HACK comment found", sev: SEVERITY.MINOR, cat: "clean-code", ref: "global — no-todo" },
  ];

  for (const filePath of files) {
    const source = readSafe(filePath);
    if (!source) continue;
    for (const { regex, msg, sev, cat, ref } of checks) {
      let m;
      regex.lastIndex = 0;
      while ((m = regex.exec(source))) {
        addViolation(sev, cat, ref, filePath, lineNumber(source, m.index), msg, "Remove before committing");
      }
    }
  }
}

// ── 6. Responsive: window.innerWidth in Render ──────────────────────

function checkResponsive() {
  const files = walkFiles(SRC, [".jsx"]);
  for (const filePath of files) {
    const source = readSafe(filePath);
    if (!source) continue;
    const regex = /window\.innerWidth/g;
    let m;
    while ((m = regex.exec(source))) {
      addViolation(SEVERITY.MAJOR, "responsive", "responsive.mdc — no-window-innerWidth",
        filePath, lineNumber(source, m.index),
        "window.innerWidth used directly — does not react to resizes",
        "Replace with useIsMobile(), useMediaQuery(), or useLayout() hook");
    }
  }
}

// ── 7. Hard-coded Hex Colors in Features ────────────────────────────

function checkHardcodedColors() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  const files = walkFiles(featuresDir);
  for (const filePath of files) {
    if (FLAGS.feature) {
      const feature = rel(filePath).split("src/features/")[1]?.split("/")[0];
      if (feature !== FLAGS.feature) continue;
    }
    const source = readSafe(filePath);
    if (!source) continue;

    const regex = /(?:color|fill|stroke|background)\s*[:=]\s*["']#[0-9a-fA-F]{3,8}["']/g;
    let m;
    while ((m = regex.exec(source))) {
      const line = lineNumber(source, m.index);
      const lineText = source.split("\n")[line - 1] || "";
      const isGoogleSvg = /fill=["']#(4285F4|34A853|FBBC05|EA4335)["']/i.test(lineText);
      if (isGoogleSvg) continue;

      addViolation(SEVERITY.MINOR, "components", "components.mdc — semantic-tokens",
        filePath, line,
        `Hard-coded hex color in feature code: ${m[0].trim()}`,
        "Use semantic Tailwind tokens or CSS variable: hsl(var(--chart-N)), hsl(var(--primary)), etc.");
    }
  }
}

// ── 8. Money Formatting: toFixed in UI ──────────────────────────────

function checkMoneyFormatting() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  const files = walkFiles(featuresDir, [".jsx"]);
  for (const filePath of files) {
    const source = readSafe(filePath);
    if (!source) continue;

    const regex = /\.toFixed\(\s*\d+\s*\)/g;
    let m;
    while ((m = regex.exec(source))) {
      addViolation(SEVERITY.MAJOR, "settings-theming", "settings-and-theming.mdc — use-money-formatter",
        filePath, lineNumber(source, m.index),
        ".toFixed() used in JSX component — bypasses masking and currency settings",
        "Use useMoneyFormatter().format() for user-visible money display");
    }
  }
}

// ── 9. Hard-coded URLs ──────────────────────────────────────────────

function checkHardcodedUrls() {
  const files = walkFiles(SRC);
  const ignoreDirs = ["assets", "styles", "components/ui"];

  for (const filePath of files) {
    const relPath = rel(filePath);
    if (ignoreDirs.some((d) => relPath.includes(`src/${d}/`))) continue;

    const source = readSafe(filePath);
    if (!source) continue;

    const regex = /["'](https?:\/\/[^"']+)["']/g;
    let m;
    while ((m = regex.exec(source))) {
      const url = m[1];
      if (url.startsWith("http://www.w3.org")) continue;
      if (url.includes("localhost") && relPath.includes("config/")) continue;

      const line = lineNumber(source, m.index);
      addViolation(SEVERITY.MINOR, "clean-code", "global — no-hardcoded-urls",
        filePath, line,
        `Hard-coded URL: ${url.substring(0, 60)}${url.length > 60 ? "..." : ""}`,
        "Extract to src/config/ constants or environment variable");
    }
  }
}

// ── 10. Top-level src/ Directory Audit ───────────────────────────────

function checkTopLevelDirs() {
  const knownDirs = new Set([
    "app", "assets", "components", "config", "domain", "features",
    "i18n", "infrastructure", "layouts", "lib", "redux", "shared", "styles",
  ]);
  const acceptedExtras = new Set(["test"]);

  if (!fs.existsSync(SRC)) return;
  const dirs = fs.readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    if (!knownDirs.has(dir) && !acceptedExtras.has(dir)) {
      addViolation(SEVERITY.MINOR, "architecture", "architecture.mdc — no-undocumented-roots",
        path.join(SRC, dir), null,
        `Undocumented top-level src/ directory: ${dir}/`,
        "Move contents to an existing layer or create an ADR in docs/adr/");
    }
  }
}

// ── 11. Feature Matrix Validation ───────────────────────────────────

function checkFeatureMatrix() {
  const yamlPath = path.join(SRC, "config", "runtime", "feature-matrix.yaml");
  const content = readSafe(yamlPath);
  if (!content) {
    addViolation(SEVERITY.MAJOR, "feature-flags", "feature-flags.mdc", null, null,
      "feature-matrix.yaml not found", "Create src/config/runtime/feature-matrix.yaml");
    return;
  }

  if (!content.includes("defaults:")) {
    addViolation(SEVERITY.MAJOR, "feature-flags", "feature-flags.mdc — defaults-required",
      yamlPath, null, "feature-matrix.yaml missing 'defaults' section", "Add defaults: block");
  }
  if (!content.includes("profiles:")) {
    addViolation(SEVERITY.MAJOR, "feature-flags", "feature-flags.mdc — profiles-required",
      yamlPath, null, "feature-matrix.yaml missing 'profiles' section", "Add profiles: with live and demo");
  } else {
    if (!content.includes("live:")) {
      addViolation(SEVERITY.MAJOR, "feature-flags", "feature-flags.mdc — live-profile",
        yamlPath, null, "feature-matrix.yaml missing 'live' profile", "Add profiles.live:");
    }
    if (!content.includes("demo:")) {
      addViolation(SEVERITY.MAJOR, "feature-flags", "feature-flags.mdc — demo-profile",
        yamlPath, null, "feature-matrix.yaml missing 'demo' profile", "Add profiles.demo:");
    }
  }
}

// ── 12. i18n Hard-coded Strings (heuristic) ─────────────────────────

function checkI18nLiterals() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  const files = walkFiles(featuresDir, [".jsx"]);
  for (const filePath of files) {
    if (FLAGS.feature) {
      const feature = rel(filePath).split("src/features/")[1]?.split("/")[0];
      if (feature !== FLAGS.feature) continue;
    }
    const source = readSafe(filePath);
    if (!source) continue;

    const hasUseLanguage = /useLanguage|useTranslation/.test(source);
    if (!hasUseLanguage) continue;

    const labelRegex = /(?:label|placeholder|title|aria-label)=["']([A-Z][a-zA-Z ]{3,})["']/g;
    let m;
    while ((m = labelRegex.exec(source))) {
      const line = lineNumber(source, m.index);
      const lineText = source.split("\n")[line - 1] || "";
      if (/\{t\(/.test(lineText)) continue;

      addViolation(SEVERITY.MINOR, "i18n", "i18n.mdc — no-hardcoded-strings",
        filePath, line,
        `Potential hard-coded label: "${m[1]}"`,
        `Replace with t("namespace.key") using useLanguage()`);
    }
  }
}

// ── 13. Deep Relative Imports ───────────────────────────────────────

function checkDeepRelativeImports() {
  const files = walkFiles(SRC);
  for (const filePath of files) {
    const source = readSafe(filePath);
    if (!source) continue;

    const regex = /from\s+["'](\.\.\/\.\.\/\.\.[\/.][^"']*)["']/g;
    let m;
    while ((m = regex.exec(source))) {
      addViolation(SEVERITY.MINOR, "architecture", "architecture.mdc — use-alias",
        filePath, lineNumber(source, m.index),
        `Deep relative import: ${m[1]}`,
        "Use @/ alias instead: @/shared/..., @/features/..., etc.");
    }
  }
}

// ── 14. Component Size Check ────────────────────────────────────────

function checkComponentSizes() {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  const files = walkFiles(featuresDir, [".jsx"]);
  for (const filePath of files) {
    if (FLAGS.feature) {
      const feature = rel(filePath).split("src/features/")[1]?.split("/")[0];
      if (feature !== FLAGS.feature) continue;
    }
    const source = readSafe(filePath);
    if (!source) continue;

    const lines = source.split("\n").length;
    const isPage = rel(filePath).includes("/pages/");
    const limit = isPage ? 120 : 80;
    const kind = isPage ? "page container" : "presentational component";

    if (lines > limit * 1.5) {
      addViolation(SEVERITY.MAJOR, "components", "components.mdc — size-limit",
        filePath, null,
        `${kind} is ${lines} lines (target: ~${limit})`,
        "Split into subcomponents or extract logic to hooks");
    } else if (lines > limit) {
      addViolation(SEVERITY.MINOR, "components", "components.mdc — size-limit",
        filePath, null,
        `${kind} is ${lines} lines (target: ~${limit})`,
        "Consider splitting into subcomponents");
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────

function buildReport() {
  const counts = { critical: 0, major: 0, minor: 0, info: 0 };
  for (const v of violations) counts[v.severity]++;

  const totalPenalty = violations.reduce((sum, v) => sum + SEVERITY_WEIGHT[v.severity], 0);
  const score = Math.max(0, 100 - totalPenalty);

  const discoveredRules = discoverRules().map((r) => r.name);
  const discoveredDocs = discoverArchDocs().map((d) => d.name);

  return {
    meta: {
      target: APP_ROOT,
      timestamp: new Date().toISOString(),
      scope: FLAGS.feature ? `--feature ${FLAGS.feature}` : FLAGS.category ? `--category ${FLAGS.category}` : "full",
      rulesDiscovered: discoveredRules,
      archDocsDiscovered: discoveredDocs,
    },
    summary: { ...counts, total: violations.length, score },
    violations: violations.sort((a, b) => {
      const sevOrder = { critical: 0, major: 1, minor: 2, info: 3 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    }),
  };
}

function printReport(report) {
  const { meta, summary } = report;

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  SMART VALIDATOR — Rules Audit Report");
  console.log("══════════════════════════════════════════════════════════\n");

  console.log(`Target:     ${meta.target}`);
  console.log(`Scope:      ${meta.scope}`);
  console.log(`Timestamp:  ${meta.timestamp}`);
  console.log(`Rules:      ${meta.rulesDiscovered.join(", ") || "none found"}`);
  console.log(`Arch docs:  ${meta.archDocsDiscovered.join(", ") || "none found"}`);

  console.log(`\n── Summary ────────────────────────────────────────────`);
  console.log(`  Critical: ${summary.critical}  |  Major: ${summary.major}  |  Minor: ${summary.minor}  |  Info: ${summary.info}`);
  console.log(`  Total: ${summary.total}  |  Compliance score: ${summary.score}%`);

  const bySeverity = { critical: [], major: [], minor: [], info: [] };
  for (const v of report.violations) bySeverity[v.severity].push(v);

  for (const sev of ["critical", "major", "minor", "info"]) {
    const items = bySeverity[sev];
    if (!items.length) continue;
    console.log(`\n── ${sev.toUpperCase()} (${items.length}) ────────────────────────────────────`);
    for (let i = 0; i < items.length; i++) {
      const v = items[i];
      const loc = v.file ? `${v.file}${v.line ? `:${v.line}` : ""}` : "(project)";
      console.log(`  ${i + 1}. [${v.category}] ${v.message}`);
      console.log(`     ${loc}`);
      console.log(`     Rule: ${v.ruleRef}`);
      console.log(`     Fix:  ${v.fix}`);
    }
  }

  if (summary.total === 0) {
    console.log("\n  All checks passed.");
  }
  console.log("\n══════════════════════════════════════════════════════════\n");
}

// ── Main ────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Error: src/ directory not found at ${SRC}`);
    process.exit(1);
  }

  const categoryFilter = FLAGS.category;
  const checks = [
    { category: "architecture",     fn: checkFeatureFolders },
    { category: "architecture",     fn: checkImportBoundaries },
    { category: "architecture",     fn: checkCrossFeatureImports },
    { category: "architecture",     fn: checkTopLevelDirs },
    { category: "architecture",     fn: checkDeepRelativeImports },
    { category: "components",       fn: checkRawHtmlElements },
    { category: "components",       fn: checkHardcodedColors },
    { category: "components",       fn: checkComponentSizes },
    { category: "clean-code",       fn: checkCleanCode },
    { category: "clean-code",       fn: checkHardcodedUrls },
    { category: "responsive",       fn: checkResponsive },
    { category: "settings-theming", fn: checkMoneyFormatting },
    { category: "feature-flags",    fn: checkFeatureMatrix },
    { category: "i18n",             fn: checkI18nLiterals },
  ];

  for (const check of checks) {
    if (categoryFilter && check.category !== categoryFilter) continue;
    check.fn();
  }

  const report = buildReport();

  if (FLAGS.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  process.exit(report.summary.critical > 0 ? 1 : 0);
}

main();
