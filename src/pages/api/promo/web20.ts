import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getPromoWeb20Config, isPromoWeb20Available, validatePromoWeb20 } from "@/lib/promoWeb20";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const config = await getPromoWeb20Config();
    return res.status(200).json({
      code: config.code,
      active: isPromoWeb20Available(config),
      minimumSubtotal: config.minimumSubtotal,
      discountValue: config.discountValue,
      startsAt: config.startsAt,
      endsAt: config.endsAt,
    });
  }

  if (req.method === "POST") {
    const session: any = await getServerSession(req, res, authOptions as any);
    const email = String((session?.user as any)?.email || req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(401).json({ error: "Inicia sesión para utilizar el cupón WEB20." });
    }
    const validation = await validatePromoWeb20({
      code: req.body?.code,
      subtotal: Number(req.body?.subtotal || 0),
      email,
      items: Array.isArray(req.body?.items) ? req.body.items : [],
    });
    if (!validation.ok) {
      return res.status(400).json({
        error: validation.message,
        missingAmount: validation.missingAmount,
        discount: 0,
      });
    }
    return res.status(200).json({
      code: validation.code,
      discount: validation.discount,
      message: validation.message,
    });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
