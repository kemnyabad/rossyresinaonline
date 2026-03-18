import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

const db = prisma as any;

const toLegacyProduct = (p: any) => ({
  _id: p.legacyId ?? p.id,
  code: p.code || "",
  title: p.title || "Producto",
  description: p.description || "",
  brand: p.brand || "",
  category: p.category || "",
  image: p.image || "/favicon-96x96.png",
  isNew: Boolean(p.isNew),
  oldPrice: p.oldPrice != null ? Number(p.oldPrice) : undefined,
  price: Number(p.price || 0),
});

const toDbData = (body: any) => {
  const legacyId = String(body?._id ?? "").trim() || null;
  const code = String(body?.code ?? "").trim() || null;
  const title = String(body?.title || "Producto").trim();
  const description = String(body?.description || "").trim();
  const brand = String(body?.brand || "").trim();
  const category = String(body?.category || "").trim();
  const image = String(body?.image || "/favicon-96x96.png").trim();
  const price = Number(body?.price || 0);
  const oldPrice = body?.oldPrice != null && body.oldPrice !== "" ? Number(body.oldPrice) : null;
  const isNew = Boolean(body?.isNew);
  return { legacyId, code, title, description, brand, category, image, price, oldPrice, isNew };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = async () => {
    const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
    return !!session && (session.user as any)?.role === "ADMIN";
  };

  if (req.method === "GET") {
    try {
      const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
      return res.status(200).json(products.map(toLegacyProduct));
    } catch {
      return res.status(500).json({ error: "No se pudieron obtener productos" });
    }
  }

  if (req.method === "POST") {
    const ok = await isAdmin();
    if (!ok) return res.status(401).json({ error: "No autorizado" });
    try {
      const data = toDbData(req.body || {});
      if (!data.title || !Number.isFinite(data.price)) {
        return res.status(400).json({ error: "Datos de producto invalidos" });
      }
      const where = data.legacyId ? { legacyId: data.legacyId } : data.code ? { code: data.code } : null;
      const created = where
        ? await db.product.upsert({
            where,
            create: data,
            update: data,
          })
        : await db.product.create({ data });
      return res.status(201).json(toLegacyProduct(created));
    } catch {
      return res.status(500).json({ error: "No se pudo crear producto" });
    }
  }

  if (req.method === "PUT") {
    const ok = await isAdmin();
    if (!ok) return res.status(401).json({ error: "No autorizado" });
    try {
      const data = toDbData(req.body || {});
      const key = String((req.body || {})._id ?? "").trim();
      if (!key) return res.status(400).json({ error: "ID requerido" });
      const existing = await db.product.findFirst({
        where: { OR: [{ id: key }, { legacyId: key }, { code: key }] },
      });
      if (!existing) return res.status(404).json({ error: "Producto no encontrado" });
      const updated = await db.product.update({
        where: { id: existing.id },
        data,
      });
      return res.status(200).json(toLegacyProduct(updated));
    } catch {
      return res.status(500).json({ error: "No se pudo actualizar producto" });
    }
  }

  if (req.method === "DELETE") {
    const ok = await isAdmin();
    if (!ok) return res.status(401).json({ error: "No autorizado" });
    try {
      const key = String((req.query._id as string) || (req.body?._id as string) || "").trim();
      if (!key) return res.status(400).json({ error: "ID requerido" });
      const existing = await db.product.findFirst({
        where: { OR: [{ id: key }, { legacyId: key }, { code: key }] },
      });
      if (!existing) return res.status(404).json({ error: "Producto no encontrado" });
      await db.product.delete({ where: { id: existing.id } });
      return res.status(204).end();
    } catch {
      return res.status(500).json({ error: "No se pudo eliminar producto" });
    }
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
