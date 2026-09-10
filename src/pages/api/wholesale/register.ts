import type { NextApiRequest, NextApiResponse } from "next";
import { registerWholesaleUser } from "@/lib/wholesaleStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

  try {
    const result = await registerWholesaleUser({
      name: String(req.body?.name || ""),
      business: String(req.body?.business || ""),
      phone: String(req.body?.phone || ""),
      city: String(req.body?.city || ""),
      channel: String(req.body?.channel || ""),
      volume: String(req.body?.volume || ""),
      password: String(req.body?.password || ""),
    });
    return res.status(201).json({ ok: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ error: String(error?.message || "No se pudo registrar") });
  }
}
