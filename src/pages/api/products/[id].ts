import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const db = prisma as any;

const normalizeImages = (images: any): string[] => {
  if (Array.isArray(images)) return images.map((x) => String(x || "").trim()).filter(Boolean);
  return [];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  const key = String(req.query.id || "").trim();
  if (!key) return res.status(400).json({ error: "ID requerido" });

  try {
    const product = await db.product.findFirst({
      where: {
        OR: [{ id: key }, { legacyId: key }, { code: key }],
      },
      select: {
        id: true, legacyId: true, code: true, barcode: true, sku: true,
        title: true, description: true, brand: true, category: true,
        image: true, images: true, price: true, oldPrice: true,
        isNew: true, stock: true,
      },
    });

    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    return res.status(200).json({
      id: product.id,
      _id: product.legacyId ?? product.id,
      code: product.code || "",
      barcode: product.barcode || "",
      sku: product.sku || "",
      stock: Number(product.stock || 0),
      title: product.title || "",
      description: product.description || "",
      brand: product.brand || "",
      category: product.category || "",
      image: product.image || "",
      images: normalizeImages(product.images),
      price: Number(product.price || 0),
      oldPrice: product.oldPrice != null ? Number(product.oldPrice) : 0,
      isNew: Boolean(product.isNew),
    });
  } catch {
    return res.status(500).json({ error: "Error al obtener producto" });
  }
}
