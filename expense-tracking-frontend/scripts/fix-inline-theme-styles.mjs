import fs from "fs";
import path from "path";

const REPLACEMENTS = [
  [/bgcolor:\s*"background\.paper"/g, 'backgroundColor: "var(--color-primary-bg)"'],
  [/bgcolor:\s*"background\.default"/g, 'backgroundColor: "var(--color-secondary-bg)"'],
  [/bgcolor:\s*"action\.hover"/g, 'backgroundColor: "var(--color-hover-bg)"'],
  [/backgroundColor:\s*"background\.paper"/g, 'backgroundColor: "var(--color-primary-bg)"'],
  [/backgroundColor:\s*"background\.default"/g, 'backgroundColor: "var(--color-secondary-bg)"'],
  [/color:\s*"text\.primary"/g, 'color: "var(--color-primary-text)"'],
  [/color:\s*"text\.secondary"/g, 'color: "var(--color-secondary-text)"'],
  [/color:\s*"primary\.main"/g, 'color: "var(--color-primary-accent)"'],
  [/color:\s*"error\.main"/g, 'color: "var(--color-error)"'],
  [/color:\s*"success\.main"/g, 'color: "var(--color-success)"'],
  [
    /border:\s*1,\s*borderColor:\s*"divider"/g,
    'border: "1px solid var(--color-border-color)"',
  ],
  [/borderColor:\s*"divider"/g, 'borderColor: "var(--color-border-color)"'],
];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !["node_modules", "dist", "build"].includes(ent.name)) {
      walk(p, acc);
    } else if (/\.(jsx|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const root = path.join(process.cwd(), "src");
let changed = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  const orig = src;
  for (const [re, rep] of REPLACEMENTS) src = src.replace(re, rep);
  if (src !== orig) {
    fs.writeFileSync(file, src);
    changed += 1;
  }
}
console.log("fixed files:", changed);
