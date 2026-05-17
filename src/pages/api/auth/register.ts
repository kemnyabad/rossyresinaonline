import type { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "@/lib/users";
import { ensureSubscriberProfile } from "@/lib/capacitaciones";
import { upsertCustomer } from "@/lib/customerStore";
import { normalizeShippingCarrier } from "@/lib/orderMeta";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M?todo no permitido" });
  }
  const { name, email, password } = req.body || {};
  const emailClean = String(email || "").trim().toLowerCase();
  const pass = String(password || "");
  const dni = String(req.body?.dni || "").replace(/\D/g, "");
  const phone = String(req.body?.phone || "").trim();
  const locationLine = String(req.body?.locationLine || "").trim();
  const shippingCarrier = normalizeShippingCarrier(req.body?.shippingCarrier);
  const shalomAgency = String(req.body?.shalomAgency || "").trim();
  const olvaAddress = String(req.body?.olvaAddress || "").trim();
  const olvaReference = String(req.body?.olvaReference || "").trim();

  if (!emailClean || !pass) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  if (pass.length < 6) {
    return res.status(400).json({ error: "La contrasena debe tener al menos 6 caracteres" });
  }
  if (!dni || dni.length < 8) {
    return res.status(400).json({ error: "Ingresa un DNI valido" });
  }
  if (!phone) {
    return res.status(400).json({ error: "Ingresa un telefono de contacto" });
  }
  if (!locationLine) {
    return res.status(400).json({ error: "Ingresa departamento, provincia y distrito" });
  }
  if (shippingCarrier === "SHALOM" && !shalomAgency) {
    return res.status(400).json({ error: "Ingresa la agencia Shalom donde recogeras" });
  }
  if (shippingCarrier === "OLVA" && (!olvaAddress || !olvaReference)) {
    return res.status(400).json({ error: "Ingresa direccion y referencia para Olva" });
  }

  try {
    const user = await createUser({
      name: String(name || "Usuario"),
      email: emailClean,
      password: pass,
      role: "CUSTOMER",
    });
    await ensureSubscriberProfile({ userId: user.id, name: user.name, email: user.email });
    const profile = {
      dni,
      name: user.name,
      phone,
      locationLine,
      shippingCarrier,
      shalomAgency,
      olvaAddress,
      olvaReference,
    };
    await upsertCustomer(profile);
    return res.status(201).json({ id: user.id, email: user.email, name: user.name, profile });
  } catch (e: any) {
    if (e?.message === "EMAIL_EXISTS") {
      return res.status(409).json({ error: "El correo ya esta registrado" });
    }
    return res.status(500).json({ error: "No se pudo registrar" });
  }
}
