import fs from "fs";
import path from "path";

const REPLACEMENTS = [
  [/backgroundColor:\s*colors\.primary_bg/g, 'bgcolor: "background.paper"'],
  [/backgroundColor:\s*colors\.secondary_bg/g, 'bgcolor: "background.default"'],
  [/backgroundColor:\s*colors\.card_bg/g, 'bgcolor: "background.paper"'],
  [/backgroundColor:\s*colors\.input_bg/g, 'bgcolor: "custom.inputBackground"'],
  [/backgroundColor:\s*colors\.hover_bg/g, 'bgcolor: "action.hover"'],
  [/backgroundColor:\s*colors\.active_bg/g, 'bgcolor: "action.selected"'],
  [/backgroundColor:\s*colors\.modal_bg/g, 'bgcolor: "background.paper"'],
  [/bgcolor:\s*colors\.primary_bg/g, 'bgcolor: "background.paper"'],
  [/color:\s*colors\.primary_text/g, 'color: "text.primary"'],
  [/color:\s*colors\.secondary_text/g, 'color: "text.secondary"'],
  [/color:\s*colors\.primary_accent/g, 'color: "primary.main"'],
  [/color:\s*colors\.accent/g, 'color: "primary.main"'],
  [/color:\s*colors\.error/g, 'color: "error.main"'],
  [/color:\s*colors\.success/g, 'color: "success.main"'],
  [/color:\s*colors\.warning/g, 'color: "warning.main"'],
  [/color:\s*colors\.info/g, 'color: "info.main"'],
  [/borderColor:\s*colors\.border_color/g, 'borderColor: "divider"'],
  [/borderColor:\s*colors\.border/g, 'borderColor: "divider"'],
  [
    /border:\s*`1px solid \$\{colors\.border_color\}`/g,
    'border: 1, borderColor: "divider"',
  ],
  [
    /border:\s*`1px solid \$\{colors\.border\}`/g,
    'border: 1, borderColor: "divider"',
  ],
];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules") walk(p, acc);
    else if (/\.(jsx|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const roots = [
  path.join(process.cwd(), "src/components"),
  path.join(process.cwd(), "src/features"),
  path.join(process.cwd(), "src/pages"),
];

let changed = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  const files = fs.statSync(root).isDirectory() ? walk(root) : [root];
  for (const file of files) {
    let src = fs.readFileSync(file, "utf8");
    if (!src.includes("colors.")) continue;
    const orig = src;
    for (const [re, rep] of REPLACEMENTS) src = src.replace(re, rep);
    if (src !== orig) {
      fs.writeFileSync(file, src);
      changed += 1;
    }
  }
}
console.log("files updated:", changed);
