import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";
import { authOptions } from "../auth/[...nextauth]";
import { readCustomers, upsertCustomer } from "@/lib/customerStore";
import { normalizeShippingCarrier } from "@/lib/orderMeta";
import { isLocalOrderSimulationRequest } from "@/lib/orderStore";

const toProfile = (row: any) => ({
  dni: row.dni || "",
  name: row.name || "",
  phone: row.phone || "",
  locationLine: row.locationLine || "",
  shippingCarrier: normalizeShippingCarrier(row.shippingCarrier),
  shalomAgency: row.shalomAgency || "",
  olvaAddress: row.olvaAddress || "",
  olvaReference: row.olvaReference || "",
});

const LOCAL_CUSTOMERS_FILE = path.join(process.cwd(), "data", "local-test-customers.json");

const readLocalCustomers = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(LOCAL_CUSTOMERS_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const upsertLocalCustomer = (profile: any) => {
  const rows = readLocalCustomers();
  const dni = String(profile.dni || "").trim();
  const now = new Date().toISOString();
  const nextProfile = { ...profile, createdAt: now, updatedAt: now };
  const index = rows.findIndex((row: any) => String(row.dni || "").trim() === dni);
  const next = index >= 0
    ? rows.map((row: any, itemIndex: number) => itemIndex === index ? { ...row, ...profile, updatedAt: now } : row)
    : [nextProfile, ...rows];
  fs.mkdirSync(path.dirname(LOCAL_CUSTOMERS_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_CUSTOMERS_FILE, JSON.stringify(next, null, 2));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.email || session?.user?.role === "ADMIN") {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const name = String(session.user.name || "").trim().toLowerCase();
      const rows = isLocalOrderSimulationRequest(req) ? readLocalCustomers() : await readCustomers();
      const found = rows.find((row) => String(row.name || "").trim().toLowerCase() === name) ||
        rows.find((row) => name && String(row.name || "").trim().toLowerCase().includes(name));
      return res.status(200).json({ found: Boolean(found), profile: found ? toProfile(found) : null });
    } catch {
      return res.status(500).json({ error: "No se pudo cargar la direccion" });
    }
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const dni = String(body.dni || "").replace(/\D/g, "");
    const name = String(body.name || session.user.name || "").trim();
    const phone = String(body.phone || "").trim();
    const locationLine = String(body.locationLine || "").trim();
    const shippingCarrier = normalizeShippingCarrier(body.shippingCarrier);
    const shalomAgency = String(body.shalomAgency || "").trim();
    const olvaAddress = String(body.olvaAddress || "").trim();
    const olvaReference = String(body.olvaReference || "").trim();

    if (!dni || dni.length < 8) return res.status(400).json({ error: "Ingresa un DNI valido" });
    if (!name) return res.status(400).json({ error: "Ingresa tu nombre completo" });
    if (!phone) return res.status(400).json({ error: "Ingresa un telefono" });
    if (!locationLine) return res.status(400).json({ error: "Ingresa departamento, provincia y distrito" });
    if (shippingCarrier === "SHALOM" && !shalomAgency) return res.status(400).json({ error: "Ingresa agencia Shalom" });
    if (shippingCarrier === "OLVA" && (!olvaAddress || !olvaReference)) {
      return res.status(400).json({ error: "Ingresa direccion y referencia para Olva" });
    }

    try {
      const profile = { dni, name, phone, locationLine, shippingCarrier, shalomAgency, olvaAddress, olvaReference };
      if (isLocalOrderSimulationRequest(req)) {
        upsertLocalCustomer(profile);
      } else {
        await upsertCustomer(profile);
      }
      return res.status(200).json({ profile });
    } catch {
      return res.status(500).json({ error: "No se pudo guardar la direccion" });
    }
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
