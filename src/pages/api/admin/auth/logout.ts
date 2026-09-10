import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminClearCookieHeader } from "@/lib/adminAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

  res.setHeader("Set-Cookie", getAdminClearCookieHeader());
  return res.status(200).json({ ok: true });
}
