import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
const db = prisma as any;

type Stat = {
  salesCount: number;
  avgRating: number;
  reviewCount: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "M?todo no permitido" });

  const idsRaw = String(req.query.ids || "").trim();
  if (!idsRaw) return res.status(200).json({});

  const identifiers = Array.from(
    new Set(
      idsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );

  try {
    const products: any[] = await db.product.findMany({
      where: {
        OR: [
          { id: { in: identifiers } },
          { legacyId: { in: identifiers } },
          { code: { in: identifiers } },
        ],
      },
      select: { id: true, legacyId: true, code: true },
    });

    const out: Record<string, Stat> = {};
    identifiers.forEach((id) => {
      out[id] = { salesCount: 0, avgRating: 0, reviewCount: 0 };
    });
    if (products.length === 0) return res.status(200).json(out);

    const productIds = products.map((p: any) => p.id);
    const byProductId = new Map(products.map((p: any) => [p.id, p]));

    const orders = await db.order.findMany({
      where: { status: { in: ["PAID", "SHIPPED"] } },
      select: { items: true },
    });
    const salesByProductId: Record<string, number> = {};
    for (const order of orders) {
      const items = Array.isArray(order.items) ? (order.items as any[]) : [];
      for (const item of items) {
        const pid = String(item?.productId || "").trim();
        if (!pid || !byProductId.has(pid)) continue;
        salesByProductId[pid] = (salesByProductId[pid] || 0) + Math.max(1, Number(item?.quantity || 1));
      }
    }

    const groupedReviews: any[] = await db.review.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const ratingsByProductId = new Map(
      groupedReviews.map((g: any) => [
        g.productId,
        { avg: Number(g._avg.rating || 0), count: Number(g._count._all || 0) },
      ])
    );

    for (const inputId of identifiers) {
      const product =
        products.find((p: any) => p.id === inputId) ||
        products.find((p: any) => String(p.legacyId || "") === inputId) ||
        products.find((p: any) => String(p.code || "") === inputId);
      if (!product) continue;

      const salesCount = salesByProductId[product.id] || 0;
      const ratingAcc = ratingsByProductId.get(product.id) || { avg: 0, count: 0 };
      out[inputId] = {
        salesCount,
        avgRating: Number(ratingAcc.avg.toFixed(1)),
        reviewCount: ratingAcc.count,
      };
    }

    return res.status(200).json(out);
  } catch {
    return res.status(500).json({ error: "No se pudieron obtener estad?sticas" });
  }
}
