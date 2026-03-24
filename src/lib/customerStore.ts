import fs from "fs";
import path from "path";
import type { ShippingCarrier } from "./orderMeta";

const runtimePath = path.join(process.cwd(), "data", "customers.json");

export type CustomerRecord = {
  dni: string;
  name: string;
  phone: string;
  locationLine: string;
  shippingCarrier: ShippingCarrier;
  shalomAgency: string;
  olvaAddress: string;
  olvaReference: string;
  createdAt: string;
  updatedAt: string;
};

function ensureFile() {
  const dir = path.dirname(runtimePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(runtimePath)) fs.writeFileSync(runtimePath, "[]", "utf-8");
}

export function readCustomers(): CustomerRecord[] {
  ensureFile();
  try {
    const raw = fs.readFileSync(runtimePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomerRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeCustomers(rows: CustomerRecord[]) {
  ensureFile();
  fs.writeFileSync(runtimePath, JSON.stringify(rows, null, 2), "utf-8");
}

export function upsertCustomer(record: Omit<CustomerRecord, "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const rows = readCustomers();
  const dni = String(record.dni || "").trim();
  if (!dni) return;

  const idx = rows.findIndex((r) => String(r.dni || "").trim() === dni);
  if (idx >= 0) {
    rows[idx] = {
      ...rows[idx],
      ...record,
      dni,
      updatedAt: now,
    };
  } else {
    rows.unshift({
      ...record,
      dni,
      createdAt: now,
      updatedAt: now,
    });
  }

  writeCustomers(rows);
}
