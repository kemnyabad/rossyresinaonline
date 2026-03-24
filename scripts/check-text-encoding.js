/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOTS = ["src", "data"];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);

const BAD_PATTERNS = [
  { re: /\uFFFD/g, label: "replacement-char" },
  { re: /Ã|Â|â€/g, label: "mojibake" },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      walk(full, out);
    } else if (EXTS.has(path.extname(entry.name).toLowerCase())) {
      const normalized = full.replace(/\\/g, "/");
      if (
        normalized.endsWith("/data/products.json") ||
        normalized.endsWith("data/products.json") ||
        normalized.endsWith("/src/data/products.json") ||
        normalized.endsWith("src/data/products.json")
      ) {
        continue;
      }
      out.push(full);
    }
  }
  return out;
}

const findings = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const content = fs.readFileSync(file, "utf8");
    for (const rule of BAD_PATTERNS) {
      if (!rule.re.test(content)) continue;
      findings.push(`${file} -> ${rule.label}`);
      rule.re.lastIndex = 0;
    }
  }
}

if (findings.length > 0) {
  console.error("Text quality check failed. Fix these files:");
  findings.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log("Text quality check passed.");
