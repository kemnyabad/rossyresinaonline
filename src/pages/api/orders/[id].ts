import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
type DbOrderStatus = "PENDING" | "PAID" | "SHIPPED";
const db = prisma as any;

const toDbStatus = (status: string): DbOrderStatus | null => {
  const s = status.trim().toLowerCase();
  if (!s) return null;
  if (s === "pending" || s === "pendiente por confirmar") return "PENDING";
  if (s === "paid" || s === "confirmado") return "PAID";
  if (s === "shipped" || s === "en proceso de envio" || s === "enviado" || s === "finalizado") {
    return "SHIPPED";
  }
  return null;
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
  const session = await getServerSession(req, res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "PATCH") {
    const id = String(req.query.id || "").trim();
    const body = req.body || {};
    const status = String(body.status || "").trim();
    if (!id || !status) return res.status(400).json({ error: "Datos incompletos" });

    const dbStatus = toDbStatus(status);
    if (!dbStatus) return res.status(400).json({ error: "Status invalido" });

    try {
      const updated = await db.order.update({
        where: { id },
        data: { status: dbStatus },
      });
      return res.status(200).json(serializeOrder(updated));
    } catch {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
