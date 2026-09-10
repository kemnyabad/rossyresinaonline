import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getSellerContext, getSellerProducts, getSellerStats, updateSellerShop } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const context = await getSellerContext(email);
    const products = await getSellerProducts(email);
    const stats = {
      ...(await getSellerStats(context.shop?.id)),
      published: products.filter((item) => item.status === "PUBLISHED").length,
      pending: products.filter((item) => item.status === "PENDING").length,
    };
    return res.status(200).json({
      role: context.role,
      application: context.application,
      shop: context.shop,
      products,
      stats,
    });
  }

  if (req.method === "PUT") {
    const shop = await updateSellerShop(email, req.body || {});
    if (!shop) return res.status(403).json({ error: "Tu tienda aun no esta activa." });
    return res.status(200).json({ shop });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
