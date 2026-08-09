/**
 * Generate src/api/endpoints/*.generated.js from Automation YAML endpoint catalogs.
 *
 * Usage (from expense-tracking-frontend):
 *   node scripts/generate-endpoint-catalog.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(FRONTEND_ROOT, "..");
const YAML_ROOT = path.join(
  REPO_ROOT,
  "Automation",
  "test-suites",
  "src",
  "main",
  "resources",
  "config",
  "endpoints",
);
const OUT_DIR = path.join(FRONTEND_ROOT, "src", "api", "endpoints");

const SERVICE_ALIASES = {
  "analytics-service": "analytics",
  "audit-service": "audit",
  "bill-service": "bill",
  "budget-service": "budget",
  "category-service": "category",
  "chat-service": "chat",
  "event-service": "event",
  "expense-service": "expense",
  "friendship-service": "friendship",
  "group-service": "group",
  "notification-service": "notification",
  "payment-service": "payment",
  "search-service": "search",
  "sharing-service": "sharing",
  "story-service": "story",
  "user-service": "user",
};

/**
 * Minimal parser for the Automation endpoint YAML shape:
 *
 * endpoints:
 *   - key: expenses.list
 *     method: GET
 *     path: /api/expenses/fetch-expenses
 *     auth: true
 */
const parseEndpointsYaml = (text, serviceId) => {
  const endpoints = [];
  let current = null;

  const flush = () => {
    if (current?.key && current?.path && current?.method) {
      endpoints.push({
        key: current.key,
        method: String(current.method).toUpperCase(),
        path: current.path,
        auth: current.auth !== false && current.auth !== "false",
        service: serviceId,
      });
    }
    current = null;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, "  ");
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const itemMatch = trimmed.match(/^- key:\s*(.+)$/);
    if (itemMatch) {
      flush();
      current = { key: itemMatch[1].trim().replace(/^["']|["']$/g, "") };
      continue;
    }

    if (!current) continue;

    const kv = trimmed.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    const [, field, rawValue] = kv;
    const value = rawValue.trim().replace(/^["']|["']$/g, "");
    if (field === "method") current.method = value;
    else if (field === "path") current.path = value;
    else if (field === "auth") current.auth = value === "true";
  }
  flush();
  return endpoints;
};

const walkYamlFiles = (dir) => {
  const results = [];
  if (!fs.existsSync(dir)) {
    throw new Error(`YAML root not found: ${dir}`);
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkYamlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".yaml")) {
      results.push(full);
    }
  }
  return results;
};

const toModuleName = (serviceId) => `${serviceId}.generated.js`;

const emitModule = (serviceId, endpoints) => {
  const lines = [
    "/**",
    ` * AUTO-GENERATED from Automation endpoint YAMLs for service "${serviceId}".`,
    " * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs",
    " */",
    "",
    `export const ${serviceId.toUpperCase()}_ENDPOINTS = {`,
  ];

  for (const ep of endpoints) {
    const prop = ep.key.includes(".")
      ? `"${ep.key}"`
      : ep.key;
    lines.push(
      `  ${prop}: { key: ${JSON.stringify(ep.key)}, service: ${JSON.stringify(ep.service)}, method: ${JSON.stringify(ep.method)}, path: ${JSON.stringify(ep.path)}, auth: ${ep.auth} },`,
    );
  }

  lines.push("};", "", `export default ${serviceId.toUpperCase()}_ENDPOINTS;`, "");
  return lines.join("\n");
};

const main = () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const byService = new Map();
  const yamlFiles = walkYamlFiles(YAML_ROOT);

  for (const file of yamlFiles) {
    const rel = path.relative(YAML_ROOT, file);
    const serviceFolder = rel.split(path.sep)[0];
    const serviceId = SERVICE_ALIASES[serviceFolder] || serviceFolder.replace(/-service$/, "");
    const text = fs.readFileSync(file, "utf8");
    const parsed = parseEndpointsYaml(text, serviceId);
    if (!byService.has(serviceId)) byService.set(serviceId, []);
    byService.get(serviceId).push(...parsed);
  }

  const indexExports = [];
  let total = 0;

  for (const [serviceId, endpoints] of [...byService.entries()].sort()) {
    // Dedupe by key (last wins)
    const map = new Map();
    endpoints.forEach((ep) => map.set(ep.key, ep));
    const unique = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
    total += unique.length;

    const fileName = toModuleName(serviceId);
    const outPath = path.join(OUT_DIR, fileName);
    fs.writeFileSync(outPath, emitModule(serviceId, unique), "utf8");
    indexExports.push({
      serviceId,
      constName: `${serviceId.toUpperCase()}_ENDPOINTS`,
      fileName: `./${fileName}`,
    });
    console.log(`  ${serviceId}: ${unique.length} endpoints -> ${fileName}`);
  }

  const indexLines = [
    "/**",
    " * AUTO-GENERATED barrel — run: node scripts/generate-endpoint-catalog.mjs",
    " */",
    "",
  ];
  for (const exp of indexExports) {
    indexLines.push(
      `import { ${exp.constName} } from "${exp.fileName.replace(".js", "")}";`,
    );
  }
  indexLines.push("");
  indexLines.push("export const GENERATED_ENDPOINTS = Object.freeze({");
  for (const exp of indexExports) {
    indexLines.push(`  ...${exp.constName},`);
  }
  indexLines.push("});", "");
  for (const exp of indexExports) {
    indexLines.push(`export { ${exp.constName} };`);
  }
  indexLines.push("");

  fs.writeFileSync(
    path.join(OUT_DIR, "generated.index.js"),
    indexLines.join("\n"),
    "utf8",
  );

  console.log(`\nGenerated ${total} endpoints across ${byService.size} services.`);
};

main();
