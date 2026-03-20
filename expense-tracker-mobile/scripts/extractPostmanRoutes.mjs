import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const postmanPath = join(repoRoot, "expense-tracking-backend", "postman-collection.json");
const outDir = join(__dirname, "..", "src", "infrastructure", "demo", "generated");
const outFile = join(outDir, "postmanRoutes.manifest.json");

function slugifySection(name) {
  return String(name || "root")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "")
    .toLowerCase();
}

function normalizePathTemplate(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  let s = rawUrl.trim();
  const q = s.indexOf("?");
  if (q !== -1) s = s.slice(0, q);
  s = s.replace(/https?:\/\/[^/]+/i, "");
  s = s.replace(/\{\{baseUrl\}\}/gi, "");
  s = s.replace(/\/+/g, "/");
  if (!s.startsWith("/")) s = `/${s}`;
  s = s.replace(/\{\{([^}]+)\}\}/g, (_, v) => {
    const key = String(v).trim().replace(/Id$/i, "id").replace(/_/g, "");
    return `:${key}`;
  });
  s = s.replace(/\/+$/, "") || "/";
  return s;
}

function walkItems(items, sectionStack, out) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (item.item) {
      const name = item.name || "";
      const isSection = /^\d{2}\.\s/.test(name) || sectionStack.length === 0;
      const nextStack = isSection && /^\d{2}\.\s/.test(name) ? [name] : [...sectionStack, name].filter(Boolean);
      walkItems(item.item, nextStack.length ? nextStack : sectionStack, out);
      continue;
    }
    const req = item.request;
    if (!req || typeof req === "string") continue;
    const method = String(req.method || "GET").toUpperCase();
    let raw = "";
    if (req.url && typeof req.url === "object" && req.url.raw) raw = req.url.raw;
    else if (typeof req.url === "string") raw = req.url;
    const pathTemplate = normalizePathTemplate(raw);
    if (!pathTemplate) continue;
    const topSection = sectionStack.find((n) => /^\d{2}\.\s/.test(n)) || sectionStack[0] || "root";
    const sectionSlug = slugifySection(topSection);
    const id = `${method}:${pathTemplate}`;
    out.push({
      id,
      method,
      pathTemplate,
      sectionSlug,
      sectionTitle: topSection,
      requestName: item.name || "",
    });
  }
}

function main() {
  const raw = readFileSync(postmanPath, "utf8");
  const collection = JSON.parse(raw);
  const rows = [];
  walkItems(collection.item || [], [], rows);
  const seen = new Set();
  const deduped = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    deduped.push(r);
  }
  deduped.sort((a, b) => a.id.localeCompare(b.id));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "expense-tracking-backend/postman-collection.json",
        routeCount: deduped.length,
        routes: deduped,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Wrote ${deduped.length} routes to ${outFile}`);
}

main();
