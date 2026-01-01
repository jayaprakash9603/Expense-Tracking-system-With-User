const fs = require("fs");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "..");
const baseDir = path.join(
  workspaceRoot,
  "Expense Tracking System FrontEnd",
  "social-media-master",
  "src"
);

const FAILURE_REGEX = /dispatch\(\{\s*type:\s*([A-Z0-9_]+_FAILURE)/g;
const THROW_REGEX = /throw\s+\w+/;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const hasFailureDispatch = FAILURE_REGEX.test(content);
  if (!hasFailureDispatch) {
    return null;
  }
  const hasThrow = THROW_REGEX.test(content);
  return { filePath, hasThrow };
}

const files = walk(baseDir);
const results = files
  .map(analyzeFile)
  .filter(Boolean)
  .filter((entry) => entry.hasThrow);

console.log(JSON.stringify(results, null, 2));
