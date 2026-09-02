import type { NextApiRequest, NextApiResponse } from "next";
import { loginWholesaleUser } from "@/lib/wholesaleStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

  try {
    const result = await loginWholesaleUser({
      user: String(req.body?.user || ""),
      password: String(req.body?.password || ""),
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error: any) {
    return res.status(401).json({ error: String(error?.message || "Acceso mayorista invalido") });
  }
}
