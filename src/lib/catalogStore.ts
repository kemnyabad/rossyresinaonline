import fs from "fs";
import path from "path";

const runtimePath = path.join(process.cwd(), "data", "products.json");
const legacyPath = path.join(process.cwd(), "src", "data", "products.json");

function ensureRuntimeFile() {
  const dir = path.dirname(runtimePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(runtimePath)) return;

  if (fs.existsSync(legacyPath)) {
    const raw = fs.readFileSync(legacyPath, "utf-8");
    fs.writeFileSync(runtimePath, raw.replace(/^\uFEFF/, ""), "utf-8");
    return;
  }

  fs.writeFileSync(runtimePath, "[]", "utf-8");
}

export function readCatalog(): any[] {
  ensureRuntimeFile();
  try {
    const raw = fs.readFileSync(runtimePath, "utf-8");
    return JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    return [];
  }
}

export function writeCatalog(products: any[]) {
  ensureRuntimeFile();
  fs.writeFileSync(runtimePath, JSON.stringify(products, null, 2), "utf-8");
}

