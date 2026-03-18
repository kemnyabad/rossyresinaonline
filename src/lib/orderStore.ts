import fs from "fs";
import path from "path";

const runtimePath = path.join(process.cwd(), "data", "orders.json");
const legacyPath = path.join(process.cwd(), "src", "data", "orders.json");

function ensureOrdersFile() {
  const dir = path.dirname(runtimePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(runtimePath)) return;

  if (fs.existsSync(legacyPath)) {
    fs.copyFileSync(legacyPath, runtimePath);
    return;
  }
  fs.writeFileSync(runtimePath, "[]", "utf-8");
}

export function readOrdersStore<T = any>(): T[] {
  ensureOrdersFile();
  try {
    const raw = fs.readFileSync(runtimePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrdersStore(data: any[]) {
  ensureOrdersFile();
  fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), "utf-8");
}

