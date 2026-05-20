import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { readProductMetricsStore, writeProductMetricsStore } from "@/lib/productMetricsStore";
const db = prisma as any;

const findProductByIdentifier = async (identifier: string) => {
  return db.product.findFirst({
    where: {
      OR: [{ id: identifier }, { legacyId: identifier }, { code: identifier }],
    },
    select: { id: true },
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const productIdentifier = String(req.query.id || "").trim();
  if (!productIdentifier) return res.status(400).json({ error: "Producto invalido" });

  if (req.method === "GET") {
    try {
      const product = await findProductByIdentifier(productIdentifier);
      if (!product) {
        return res.status(200).json({ productId: productIdentifier, paidUnits: 0, salesCount: 0 });
      }
      const orders = await db.order.findMany({
        where: { status: { in: ["PAID", "SHIPPED"] } },
        select: { items: true },
      });

      let paidUnits = 0;
      for (const order of orders) {
        const items = Array.isArray(order.items) ? (order.items as any[]) : [];
        for (const item of items) {
          if (String(item?.productId || "") !== product.id) continue;
          paidUnits += Math.max(1, Number(item?.quantity || 1));
        }
      }
      return res.status(200).json({
        productId: productIdentifier,
        paidUnits,
        salesCount: paidUnits,
      });
    } catch {
      return res.status(500).json({ error: "No se pudo obtener m?tricas" });
    }
  }

  if (req.method === "POST") {
    const event = String(req.body?.event || "").trim();
    if (event !== "cart_add") return res.status(400).json({ error: "Evento no soportado" });

    const quantity = Math.max(1, Math.floor(Number(req.body?.quantity || 1)));
    try {
      const product = await findProductByIdentifier(productIdentifier);
      const metricKey = String(product?.id || productIdentifier);
      const store = readProductMetricsStore();
      const current = store[metricKey] || { cartAdds: 0, updatedAt: new Date(0).toISOString() };
      store[metricKey] = {
        cartAdds: Number(current.cartAdds || 0) + quantity,
        updatedAt: new Date().toISOString(),
      };
      writeProductMetricsStore(store);
      return res.status(200).json({ ok: true, productId: productIdentifier, cartAdds: store[metricKey].cartAdds });
    } catch {
      return res.status(500).json({ error: "No se pudo registrar la metrica" });
    }
  }

  return res.status(405).json({ error: "M?todo no permitido" });
}
