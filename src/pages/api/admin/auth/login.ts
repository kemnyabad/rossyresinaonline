import type { NextApiRequest, NextApiResponse } from "next";
import {
  createAdminSessionToken,
  getAdminCookieHeader,
  verifyAdminCredentials,
} from "@/lib/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!(await verifyAdminCredentials(email, password))) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  const token = createAdminSessionToken(email);
  res.setHeader("Set-Cookie", getAdminCookieHeader(token));
  return res.status(200).json({ ok: true, user: { email, role: "ADMIN" } });
}
