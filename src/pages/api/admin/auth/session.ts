import type { NextApiRequest, NextApiResponse } from "next";
import { readAdminSessionFromReq } from "@/lib/adminAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Metodo no permitido" });

  const admin = readAdminSessionFromReq(req);
  if (!admin) return res.status(401).json({ user: null });

  return res.status(200).json({ user: admin });
}
