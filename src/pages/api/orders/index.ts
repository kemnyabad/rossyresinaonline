import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
type DbOrderStatus = "PENDING" | "PAID" | "SHIPPED";
const db = prisma as any;

type IncomingItem = {
  _id?: string | number;
  productId?: string | number;
  code?: string;
  quantity?: number;
};

const toLegacyStatus = (status: DbOrderStatus): string => {
  if (status === "PAID") return "Confirmado";
  if (status === "SHIPPED") return "Enviado";
  return "Pendiente por confirmar";
};

const serializeOrder = (order: any) => ({
  id: order.id,
  date: new Date(order.createdAt).toISOString().slice(0, 10),
  status: toLegacyStatus(order.status as DbOrderStatus),
  total: Number(order.total || 0),
  items: Array.isArray(order.items) ? order.items : [],
  customer: {
    name: order.customerName || "",
    email: order.customerEmail || "",
    phone: order.customerPhone || "",
    address: order.customerAddress || "",
    city: order.customerCity || "",
    district: order.customerDistrict || "",
    notes: order.customerNotes || "",
  },
  paymentImage: order.paymentImage || "",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const email = String(req.query.email || "").trim().toLowerCase();
    try {
      if (email) {
        const orders = await db.order.findMany({
          where: { customerEmail: email },
          orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(orders.map(serializeOrder));
      }
      const session = await getServerSession(req, res, authOptions as any);
      const ok = session && (session.user as any)?.role === "ADMIN";
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
      return res.status(200).json(orders.map(serializeOrder));
    } catch {
      return res.status(500).json({ error: "No se pudieron obtener pedidos" });
    }
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const customer = body.customer || {};
    const items = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];

    const email = String(customer.email || "").trim().toLowerCase();
    const name = String(customer.name || "").trim();
    const phone = String(customer.phone || "").trim();
    const address = String(customer.address || "").trim();
    const city = String(customer.city || "").trim();
    const district = String(customer.district || "").trim();

    if (!email) return res.status(400).json({ error: "Email requerido" });
    if (!name || !phone || !address || !city || !district) {
      return res.status(400).json({ error: "Datos de cliente incompletos" });
    }
    if (items.length === 0) return res.status(400).json({ error: "Carrito vacio" });

    try {
      const keys = Array.from(
        new Set(
          items
            .map((it) => String(it.productId ?? it._id ?? it.code ?? "").trim())
            .filter(Boolean)
        )
      );
      if (keys.length === 0) return res.status(400).json({ error: "Items invalidos" });

      const products = await db.product.findMany({
        where: {
          OR: [
            { id: { in: keys } },
            { legacyId: { in: keys } },
            { code: { in: keys } },
          ],
        },
      });

      const byId = new Map(products.map((p) => [String(p.id), p]));
      const byLegacyId = new Map(
        products
          .filter((p) => p.legacyId)
          .map((p) => [String(p.legacyId), p])
      );
      const byCode = new Map(
        products
          .filter((p) => p.code)
          .map((p) => [String(p.code), p])
      );

      const normalizedItems: Array<{
        productId: string;
        legacyId: string | null;
        code: string | null;
        title: string;
        quantity: number;
        price: number;
      }> = [];

      let computedTotal = 0;
      for (const item of items) {
        const key = String(item.productId ?? item._id ?? item.code ?? "").trim();
        const qty = Math.max(1, Number(item.quantity || 1));
        const product = byId.get(key) || byLegacyId.get(key) || byCode.get(key);
        if (!product) {
          return res.status(400).json({ error: `Producto no encontrado en DB: ${key}` });
        }
        const price = Number(product.price);
        computedTotal += price * qty;
        normalizedItems.push({
          productId: product.id,
          legacyId: product.legacyId || null,
          code: product.code || null,
          title: product.title,
          quantity: qty,
          price,
        });
      }

      const session = await getServerSession(req, res, authOptions as any);
      const sessionEmail = String((session?.user as any)?.email || "")
        .trim()
        .toLowerCase();
      const user = sessionEmail
        ? await db.user.findUnique({ where: { email: sessionEmail } })
        : await db.user.findUnique({ where: { email } });

      const created = await db.order.create({
        data: {
          userId: user?.id || null,
          status: "PENDING",
          total: computedTotal,
          items: normalizedItems as any,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
          customerCity: city,
          customerDistrict: district,
          customerNotes: String(customer.notes || ""),
          paymentImage: String(body.paymentImage || ""),
        },
      });

      return res.status(201).json(serializeOrder(created));
    } catch {
      return res.status(500).json({ error: "No se pudo crear el pedido" });
    }
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
