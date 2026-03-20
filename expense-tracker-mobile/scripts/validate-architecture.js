/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const LAYER_ORDER = [
  "app",
  "features",
  "domain",
  "infrastructure",
  "redux",
  "layouts",
  "shared",
  "components",
];

const FORBIDDEN = {
  domain: new Set(["features", "app", "layouts"]),
  infrastructure: new Set(["features", "app", "layouts", "redux"]),
  shared: new Set(["features", "domain", "app", "layouts", "redux"]),
  components: new Set(["features", "domain", "redux"]),
};

const TEMP_EXEMPTIONS = [
  "src/shared/hooks/app/useAppInitialization.js",
  "src/shared/hooks/theme/useTheme.js",
  "src/shared/hooks/settings/useMoneyFormatter.js",
];

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolute));
      continue;
    }

    if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(absolute);
    }
  }

  return files;
}

function getLayer(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const relative = normalized.split("/src/")[1] || "";
  const top = relative.split("/")[0];
  return LAYER_ORDER.includes(top) ? top : null;
}

function extractAliasImports(source) {
  const regex = /from\s+["'](@\/[^"']+)["']/g;
  const imports = [];
  let match = regex.exec(source);

  while (match) {
    imports.push(match[1]);
    match = regex.exec(source);
  }

  return imports;
}

function aliasToLayer(aliasPath) {
  const withoutPrefix = aliasPath.replace("@/", "");
  const top = withoutPrefix.split("/")[0];
  return LAYER_ORDER.includes(top) ? top : null;
}

function validateFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const currentLayer = getLayer(filePath);
  if (!currentLayer) return [];

  const relativePath = path.relative(ROOT, filePath).replace(/\\/g, "/");
  if (TEMP_EXEMPTIONS.includes(relativePath)) return [];

  const imports = extractAliasImports(source);
  const forbidden = FORBIDDEN[currentLayer];
  if (!forbidden) return [];

  return imports
    .map((imp) => ({ importPath: imp, targetLayer: aliasToLayer(imp) }))
    .filter(({ targetLayer }) => targetLayer && forbidden.has(targetLayer))
    .map(({ importPath, targetLayer }) => ({
      filePath,
      currentLayer,
      importPath,
      targetLayer,
    }));
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error("src directory was not found.");
    process.exit(1);
  }

  const files = walkFiles(SRC_DIR);
  const violations = files.flatMap(validateFile);

  if (violations.length > 0) {
    console.error("Architecture boundary violations detected:\n");
    for (const violation of violations) {
      const relative = path.relative(ROOT, violation.filePath).replace(/\\/g, "/");
      console.error(
        `- ${relative}: ${violation.currentLayer} must not import ${violation.targetLayer} (${violation.importPath})`,
      );
    }
    process.exit(1);
  }

  console.log("Architecture validation passed.");
}

main();
