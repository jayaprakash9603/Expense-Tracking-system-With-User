import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "src");
const srcRoot = root;

function walk(d) {
  const out = [];
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    if (ent.name === "node_modules") continue;
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(js|jsx|mjs)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function toAliasFromRel(rel) {
  const noExt = rel.replace(/\.(js|jsx|mjs)$/, "");
  return `@/${noExt.replace(/\\/g, "/")}`;
}

const files = walk(root);
const stubs = [];

for (const fp of files) {
  const raw = fs.readFileSync(fp, "utf8").trim();
  if (!raw) continue;
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length !== 1) continue;
  const line = lines[0];
  const m1 = line.match(/^export\s+\*\s+from\s+["'](.+)["'];?$/);
  const m2 = line.match(/^export\s*\{[^}]+\}\s+from\s+["'](.+)["'];?$/);
  const spec = m1?.[1] ?? m2?.[1];
  if (!spec) continue;

  let targetAlias;
  if (spec.startsWith("@/")) {
    targetAlias = spec.replace(/\.(js|jsx|mjs)$/, "");
  } else {
    const dir = path.dirname(fp);
    const resolved = path.normalize(path.join(dir, spec));
    const rel = path.relative(srcRoot, resolved);
    if (!rel || rel.startsWith("..")) {
      stubs.push({ fp, error: "resolve", spec });
      continue;
    }
    targetAlias = toAliasFromRel(rel);
  }

  const stubRel = path.relative(srcRoot, fp).replace(/\\/g, "/");
  const stubAlias = toAliasFromRel(stubRel);
  stubs.push({ stubPath: fp, stubAlias, targetAlias, line });
}

console.log(JSON.stringify(stubs, null, 2));
