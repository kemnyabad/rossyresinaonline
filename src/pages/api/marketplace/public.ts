import type { NextApiRequest, NextApiResponse } from "next";
import { readMarketplace } from "@/lib/marketplaceStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Metodo no permitido" });

  const data = readMarketplace();
  const shopSlug = String(req.query.shop || "");
  const productSlug = String(req.query.product || "");
  const published = data.products.filter((item) => item.status === "PUBLISHED");

  if (shopSlug) {
    const shop = data.shops.find((item) => item.slug === shopSlug && item.status === "ACTIVE");
    if (!shop) return res.status(404).json({ error: "Tienda no encontrada" });
    return res.status(200).json({
      shop,
      products: published.filter((item) => item.shopId === shop.id),
    });
  }

  if (productSlug) {
    const product = published.find((item) => item.slug === productSlug);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    const shop = data.shops.find((item) => item.id === product.shopId) || null;
    return res.status(200).json({ product, shop });
  }

  const categories = Array.from(new Set(published.map((item) => item.category).filter(Boolean))).sort();
  const products = published.map((product) => ({
    ...product,
    shop: data.shops.find((shop) => shop.id === product.shopId) || null,
  }));
  return res.status(200).json({
    products,
    recent: products.slice(0, 12),
    featured: products.filter((item) => item.featured).slice(0, 12),
    categories,
  });
}
