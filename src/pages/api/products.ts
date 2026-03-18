import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { readCatalog, writeCatalog } from "@/lib/catalogStore";
import prisma from "@/lib/prisma";

const normalizeImage = (img?: string) => {
  const t = String(img || "").trim();
  if (!t) return "/favicon-96x96.png";
  let u = t.replace(/\\/g, "/");
  if (!u.startsWith("/") && !/^https?:\/\//i.test(u)) u = "/" + u;
  return u;
};

const syncProductToPrisma = async (product: any) => {
  const legacyId = String(product?._id ?? "").trim();
  const code = String(product?.code ?? "").trim() || null;
  const title = String(product?.title || "Producto");
  const description = String(product?.description || "");
  const brand = String(product?.brand || "");
  const category = String(product?.category || "");
  const image = normalizeImage(product?.image);
  const price = Number(product?.price || 0);
  const oldPrice = product?.oldPrice != null ? Number(product.oldPrice) : null;
  const isNew = Boolean(product?.isNew);

  const where =
    legacyId
      ? { legacyId }
      : code
        ? { code }
        : null;
  if (!where) return;

  await prisma.product.upsert({
    where,
    update: { code, title, description, brand, category, image, price, oldPrice, isNew },
    create: {
      legacyId,
      code,
      title,
      description,
      brand,
      category,
      image,
      price,
      oldPrice,
      isNew,
    },
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const products = readCatalog();
    return res.status(200).json(products);
  }

  const isAdmin = async () => {
    const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
    return !!session && (session.user as any)?.role === "ADMIN";
  };

  if (req.method === "POST") {
    return isAdmin().then(async (ok) => {
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const products = readCatalog();
      const body = req.body || {};
      const newId = body._id ?? Date.now();
      const product = { ...body, _id: newId };
      products.push(product);
      writeCatalog(products);
      try {
        await syncProductToPrisma(product);
      } catch {
        return res.status(500).json({ error: "Producto guardado en catalogo, pero fallo sync DB" });
      }
      return res.status(201).json(product);
    });
  }

  if (req.method === "PUT") {
    return isAdmin().then(async (ok) => {
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const products = readCatalog();
      const body = req.body || {};
      const id = body._id;
      const idx = products.findIndex((p: any) => p._id == id);
      if (idx === -1) return res.status(404).json({ error: "Producto no encontrado" });
      products[idx] = { ...products[idx], ...body };
      writeCatalog(products);
      try {
        await syncProductToPrisma(products[idx]);
      } catch {
        return res.status(500).json({ error: "Producto actualizado en catalogo, pero fallo sync DB" });
      }
      return res.status(200).json(products[idx]);
    });
  }

  if (req.method === "DELETE") {
    return isAdmin().then(async (ok) => {
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const products = readCatalog();
      const id = (req.query._id as string) || (req.body?._id as string);
      const before = products.length;
      const toDelete = products.find((p: any) => String(p._id) === String(id));
      const filtered = products.filter((p: any) => String(p._id) !== String(id));
      if (filtered.length === before) return res.status(404).json({ error: "Producto no encontrado" });
      writeCatalog(filtered);

      try {
        const key = String(id || "").trim();
        await prisma.product.deleteMany({
          where: {
            OR: [{ id: key }, { legacyId: key }, toDelete?.code ? { code: String(toDelete.code) } : { id: "__none__" }],
          },
        });
      } catch {
        return res.status(500).json({ error: "Producto eliminado en catalogo, pero fallo sync DB" });
      }
      return res.status(204).end();
    });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
