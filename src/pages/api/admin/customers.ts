import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminApiRequest } from "@/lib/adminAuth";
import { readCustomers } from "@/lib/customerStore";
import prisma from "@/lib/prisma";
import { isInternalTestOrder } from "@/lib/testOrders";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminApiRequest(req)) return res.status(401).json({ error: 'No autorizado' });

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const q = String(req.query.q || "").trim().toLowerCase();
  const rows = await readCustomers();
  const filtered = q
    ? rows.filter((c) => {
        return (
          String(c.name || "").toLowerCase().includes(q) ||
          String(c.dni || "").toLowerCase().includes(q) ||
          String(c.phone || "").toLowerCase().includes(q) ||
          String(c.locationLine || "").toLowerCase().includes(q)
        );
      })
    : rows;

  const orders = await (prisma as any).order.findMany({
    select: {
      total: true,
      customerName: true,
      customerPhone: true,
      customerNotes: true,
      createdAt: true,
    },
  });
  const realOrders = orders.filter((order: any) => !isInternalTestOrder(order));
  const enriched = filtered.map((customer) => {
    const dni = String(customer.dni || "").trim();
    const phone = String(customer.phone || "").replace(/\D/g, "");
    const name = String(customer.name || "").trim().toLowerCase();
    const customerOrders = realOrders.filter((order: any) => {
      const orderPhone = String(order.customerPhone || "").replace(/\D/g, "");
      const orderName = String(order.customerName || "").trim().toLowerCase();
      const notes = String(order.customerNotes || "");
      return (
        (dni && notes.includes(dni)) ||
        (phone && orderPhone === phone) ||
        (name && orderName === name)
      );
    });
    const lastOrderAt = customerOrders
      .map((order: any) => order.createdAt?.toISOString?.() || String(order.createdAt || ""))
      .sort()
      .at(-1) || "";
    return {
      ...customer,
      totalOrders: customerOrders.length,
      totalSpent: customerOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0),
      lastOrderAt,
    };
  });

  const sorted = [...enriched].sort((a, b) => {
    return String((b as any).lastOrderAt || b.updatedAt || "").localeCompare(String((a as any).lastOrderAt || a.updatedAt || ""));
  });

  return res.status(200).json(sorted);
}
