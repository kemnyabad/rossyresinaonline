import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerContext,
  readMarketplace,
  setSellerProductStatus,
  updateSellerProduct,
} from "@/lib/marketplaceStore";
import prisma from "@/lib/prisma";
import { DB_PRODUCT_PREFIX, mapDbProduct, safeParseMarketplaceMessage } from "@/lib/marketplaceDb";

const slugify = (value: string) =>
  String(value || "producto")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "producto";

async function createDbProduct(email: string, body: any) {
  const payload = {
    nombre: String(body.name || "").trim(),
    categoria: String(body.category || "").trim(),
    precio: Number(body.price || 0),
    descripcion: String(body.description || "").trim(),
    imagenes: Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [],
    slug: slugify(body.name),
    destacado: false,
  };
  const row = await (prisma as any).capacitacionInscripcion.create({
    data: {
      nombre: payload.nombre,
      email,
      telefono: "",
      curso: "MARKETPLACE_PRODUCT",
      nivel: "Marketplace",
      mensaje: JSON.stringify(payload),
      estado: "PENDIENTE",
    },
  });
  return mapDbProduct(row);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const data = readMarketplace();
    const rows = await (prisma as any).capacitacionInscripcion.findMany({
      where: { email, curso: "MARKETPLACE_PRODUCT" },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json([
      ...rows.map(mapDbProduct),
      ...data.products.filter((item) => item.sellerEmail === email),
    ]);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!String(body.name || "").trim() || !String(body.category || "").trim() || Number(body.price || 0) <= 0) {
      return res.status(400).json({ error: "Nombre, categoria y precio son obligatorios." });
    }
    let product = null;
    try {
      product = createSellerProduct(email, body);
    } catch {
      product = null;
    }
    if (!product) {
      const context = getSellerContext(email);
      const approvedDbApplication = await (prisma as any).capacitacionInscripcion.findFirst({
        where: { email, curso: "VENDE_CON_NOSOTROS", estado: "APROBADO" },
        orderBy: { createdAt: "desc" },
      });
      if (context.role !== "SELLER" && !approvedDbApplication) {
        return res.status(403).json({ error: "Tu tienda aun no esta activa." });
      }
      product = await createDbProduct(email, body);
    }
    return res.status(201).json({ product });
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    const id = String(body.id || "");
    if (!id) return res.status(400).json({ error: "Producto no identificado." });
    if (id.startsWith(DB_PRODUCT_PREFIX)) {
      const dbId = id.slice(DB_PRODUCT_PREFIX.length);
      const row = await (prisma as any).capacitacionInscripcion.findUnique({ where: { id: dbId } });
      if (!row || String(row.email || "").toLowerCase() !== email) return res.status(404).json({ error: "Producto no encontrado." });
      const meta = safeParseMarketplaceMessage(row.mensaje);
      if (body.action === "pause" || body.action === "reactivate") {
        const estado = body.action === "pause" ? "PAUSADO" : "PENDIENTE";
        const updated = await (prisma as any).capacitacionInscripcion.update({ where: { id: dbId }, data: { estado } });
        return res.status(200).json({ product: mapDbProduct(updated) });
      }
      const next = {
        ...meta,
        nombre: String(body.name ?? meta.nombre ?? ""),
        categoria: String(body.category ?? meta.categoria ?? ""),
        precio: Number(body.price ?? meta.precio ?? 0),
        descripcion: String(body.description ?? meta.descripcion ?? ""),
        imagenes: Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : meta.imagenes || [],
        slug: meta.slug || slugify(body.name || meta.nombre),
      };
      const updated = await (prisma as any).capacitacionInscripcion.update({
        where: { id: dbId },
        data: { nombre: next.nombre, mensaje: JSON.stringify(next), estado: "PENDIENTE" },
      });
      return res.status(200).json({ product: mapDbProduct(updated) });
    }
    if (body.action === "pause") {
      const product = setSellerProductStatus(email, id, "PAUSED");
      return product ? res.status(200).json({ product }) : res.status(404).json({ error: "Producto no encontrado." });
    }
    if (body.action === "reactivate") {
      const product = setSellerProductStatus(email, id, "PENDING");
      return product ? res.status(200).json({ product }) : res.status(404).json({ error: "Producto no encontrado." });
    }
    const product = updateSellerProduct(email, id, body);
    return product ? res.status(200).json({ product }) : res.status(404).json({ error: "Producto no encontrado." });
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id || "");
    if (!id) return res.status(400).json({ error: "Producto no identificado." });
    if (id.startsWith(DB_PRODUCT_PREFIX)) {
      const dbId = id.slice(DB_PRODUCT_PREFIX.length);
      const row = await (prisma as any).capacitacionInscripcion.findUnique({ where: { id: dbId } });
      if (!row || String(row.email || "").toLowerCase() !== email) return res.status(404).json({ error: "Producto no encontrado." });
      await (prisma as any).capacitacionInscripcion.delete({ where: { id: dbId } });
      return res.status(204).end();
    }
    const ok = deleteSellerProduct(email, id);
    return ok ? res.status(204).end() : res.status(404).json({ error: "Producto no encontrado." });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
