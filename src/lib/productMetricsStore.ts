import fs from "fs";
import path from "path";

const runtimePath = path.join(process.cwd(), "data", "product-metrics.json");

export type ProductMetric = {
  cartAdds: number;
  updatedAt: string;
};

export type ProductMetricsMap = Record<string, ProductMetric>;

function ensureMetricsFile() {
  const dir = path.dirname(runtimePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(runtimePath)) fs.writeFileSync(runtimePath, "{}", "utf-8");
}

export function readProductMetricsStore(): ProductMetricsMap {
  ensureMetricsFile();
  try {
    const raw = fs.readFileSync(runtimePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as ProductMetricsMap;
  } catch {
    return {};
  }
}

export function writeProductMetricsStore(data: ProductMetricsMap) {
  ensureMetricsFile();
  fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), "utf-8");
}
