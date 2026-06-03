import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminApiRequest } from "@/lib/adminAuth";
import { getPromoWeb20Config, writePromoWeb20Config } from "@/lib/promoWeb20";

const toIsoLike = (value: unknown, fallback: string) => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  const date = new Date(raw);
  return Number.isFinite(+date) ? date.toISOString() : fallback;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminApiRequest(req)) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    return res.status(200).json(await getPromoWeb20Config());
  }

  if (req.method === "PUT") {
    const current = await getPromoWeb20Config();
    const next = await writePromoWeb20Config({
      code: "WEB20",
      active: Boolean(req.body?.active),
      minimumSubtotal: Number(req.body?.minimumSubtotal || current.minimumSubtotal),
      discountValue: Number(req.body?.discountValue || current.discountValue),
      startsAt: toIsoLike(req.body?.startsAt, current.startsAt),
      endsAt: toIsoLike(req.body?.endsAt, current.endsAt),
      maxUses: Math.max(0, Math.floor(Number(req.body?.maxUses || 0))),
    });
    return res.status(200).json(next);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
