import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getSellerContext, getSellerStats, readMarketplace, updateSellerShop } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const context = getSellerContext(email);
    const data = readMarketplace();
    const products = context.shop ? data.products.filter((item) => item.shopId === context.shop?.id) : [];
    return res.status(200).json({
      role: context.role,
      application: context.application,
      shop: context.shop,
      products,
      stats: getSellerStats(context.shop?.id),
    });
  }

  if (req.method === "PUT") {
    const shop = updateSellerShop(email, req.body || {});
    if (!shop) return res.status(403).json({ error: "Tu tienda aun no esta activa." });
    return res.status(200).json({ shop });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
