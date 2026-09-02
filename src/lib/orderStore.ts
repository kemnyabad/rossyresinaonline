import fs from "fs";
import path from "path";
import type { NextApiRequest } from "next";

const DATA_FILE = path.join(process.cwd(), "data", "local-test-orders.json");

export function isLocalOrderSimulationRequest(req: Pick<NextApiRequest, "headers">) {
  const host = String(req.headers.host || "").toLowerCase();
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]")
  );
}

export function readOrdersStore<T = any>(): T[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrdersStore(data: any[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(Array.isArray(data) ? data : [], null, 2));
}

export function upsertLocalOrder(order: any) {
  const orders = readOrdersStore<any>();
  const index = orders.findIndex((item) => String(item.id) === String(order.id));
  const next = index >= 0 ? [...orders.slice(0, index), order, ...orders.slice(index + 1)] : [order, ...orders];
  writeOrdersStore(next);
  return order;
}
