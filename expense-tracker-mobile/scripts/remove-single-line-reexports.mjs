import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(js|jsx|mjs)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function parseReexportLine(line) {
  const mStar = line.match(/^export\s+\*\s+from\s+["'](.+)["']\s*;?$/);
  if (mStar) return { kind: "star", spec: mStar[1] };
  const mNamed = line.match(/^export\s*\{([^}]+)\}\s+from\s+["'](.+)["']\s*;?$/);
  if (mNamed) return { kind: "named", spec: mNamed[2], names: mNamed[1] };
  return null;
}

function resolveSpecToPath(fromFile, spec) {
  if (spec.startsWith("@/")) {
    const rel = spec.slice(2);
    const base = path.join(srcRoot, rel);
    const candidates = [
      base,
      `${base}.js`,
      `${base}.jsx`,
      `${base}.mjs`,
      path.join(base, "index.js"),
      path.join(base, "index.jsx"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }
  const dir = path.dirname(fromFile);
  const joined = path.normalize(path.join(dir, spec));
  const candidates = [
    joined,
    `${joined}.js`,
    `${joined}.jsx`,
    `${joined}.mjs`,
    path.join(joined, "index.js"),
    path.join(joined, "index.jsx"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function fileToAliases(absPath) {
  const rel = path.relative(srcRoot, absPath).replace(/\\/g, "/");
  const noExt = rel.replace(/\.(js|jsx|mjs)$/, "");
  const aliases = new Set();
  aliases.add(`@/${noExt}`);
  if (noExt.endsWith("/index")) {
    aliases.add(`@/${noExt.slice(0, -"/index".length)}`);
  }
  return [...aliases];
}

function isSingleLineReexport(fp) {
  const raw = fs.readFileSync(fp, "utf8").trim();
  if (!raw) return false;
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length !== 1) return false;
  return parseReexportLine(lines[0]) != null;
}

function resolveFinalTarget(fp, stack = new Set()) {
  if (stack.has(fp)) throw new Error(`cycle ${fp}`);
  stack.add(fp);
  const raw = fs.readFileSync(fp, "utf8").trim();
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length !== 1) {
    stack.delete(fp);
    return fileToAliases(fp)[0];
  }
  const parsed = parseReexportLine(lines[0]);
  if (!parsed) {
    stack.delete(fp);
    return fileToAliases(fp)[0];
  }
  const next = resolveSpecToPath(fp, parsed.spec);
  if (!next) {
    stack.delete(fp);
    return fileToAliases(fp)[0];
  }
  if (isSingleLineReexport(next)) {
    const r = resolveFinalTarget(next, stack);
    stack.delete(fp);
    return r;
  }
  stack.delete(fp);
  return fileToAliases(next)[0];
}

const allFiles = walk(srcRoot);
const stubFiles = allFiles.filter(isSingleLineReexport);

const replacements = new Map();
for (const stub of stubFiles) {
  const finalAlias = resolveFinalTarget(stub);
  for (const a of fileToAliases(stub)) {
    if (a !== finalAlias) replacements.set(a, finalAlias);
  }
}

const sortedKeys = [...replacements.keys()].sort((a, b) => b.length - a.length);

const replaceInProject = () => {
  const targets = walk(projectRoot).filter(
    (p) =>
      !p.includes("node_modules") &&
      /\.(js|jsx|mjs|md|json|html)$/.test(p) &&
      !p.includes(`${path.sep}dist${path.sep}`),
  );
  for (const fp of targets) {
    let text = fs.readFileSync(fp, "utf8");
    let changed = false;
    for (const from of sortedKeys) {
      const to = replacements.get(from);
      const patterns = [
        [`from "${from}"`, `from "${to}"`],
        [`from '${from}'`, `from '${to}'`],
        [`import "${from}"`, `import "${to}"`],
        [`import '${from}'`, `import '${to}'`],
      ];
      for (const [a, b] of patterns) {
        if (text.includes(a)) {
          text = text.split(a).join(b);
          changed = true;
        }
      }
    }
    if (changed) fs.writeFileSync(fp, text, "utf8");
  }
};

replaceInProject();

for (const stub of stubFiles) {
  fs.unlinkSync(stub);
}

console.log(
  JSON.stringify(
    { removed: stubFiles.length, replacements: Object.fromEntries(replacements) },
    null,
    2,
  ),
);
