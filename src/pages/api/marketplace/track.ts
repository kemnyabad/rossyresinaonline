import type { NextApiRequest, NextApiResponse } from "next";
import { recordMarketplaceEvent } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });
  const type = String(req.body?.type || "");
  if (!["SHOP_VIEW", "PRODUCT_VIEW", "WHATSAPP_CLICK"].includes(type)) {
    return res.status(400).json({ error: "Evento invalido" });
  }
  await recordMarketplaceEvent({
    type: type as any,
    shopId: req.body?.shopId ? String(req.body.shopId) : undefined,
    productId: req.body?.productId ? String(req.body.productId) : undefined,
  });
  return res.status(204).end();
}
