import type { NextApiRequest, NextApiResponse } from "next";
import { readMarketplace, toPublicProduct, toPublicShop } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Metodo no permitido" });

  const { shops, products: allProducts } = await readMarketplace();
  const shopSlug = String(req.query.shop || "");
  const productSlug = String(req.query.product || "");
  const published = allProducts.filter((item) => item.status === "PUBLISHED");

  if (shopSlug) {
    const shop = shops.find((item) => item.slug === shopSlug && item.status === "ACTIVE");
    if (!shop) return res.status(404).json({ error: "Tienda no encontrada" });
    return res.status(200).json({
      shop: toPublicShop(shop),
      products: published.filter((item) => item.shopId === shop.id).map(toPublicProduct),
    });
  }

  if (productSlug) {
    const product = published.find((item) => item.slug === productSlug);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    const shop = shops.find((item) => item.id === product.shopId) || null;
    return res.status(200).json({
      product: toPublicProduct(product),
      shop: toPublicShop(shop),
    });
  }

  const categories = Array.from(new Set(published.map((item) => item.category).filter(Boolean))).sort();
  const products = published.map((product) => ({
    ...toPublicProduct(product),
    shop: toPublicShop(shops.find((shop) => shop.id === product.shopId) || null),
  }));
  return res.status(200).json({
    products,
    recent: products.slice(0, 12),
    featured: products.filter((item) => item.featured).slice(0, 12),
    categories,
  });
}
