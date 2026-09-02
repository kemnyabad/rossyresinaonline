import type { NextApiRequest, NextApiResponse } from "next";
import { getWholesaleSession, logoutWholesaleSession } from "@/lib/wholesaleStore";

const tokenFromReq = (req: NextApiRequest) =>
  String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim() ||
  String(req.body?.token || req.query?.token || "").trim();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = tokenFromReq(req);

  if (req.method === "GET") {
    const session = await getWholesaleSession(token);
    if (!session) return res.status(401).json({ error: "Sesion mayorista no encontrada" });
    return res.status(200).json({ ok: true, ...session });
  }

  if (req.method === "DELETE" || req.method === "POST") {
    await logoutWholesaleSession(token);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
