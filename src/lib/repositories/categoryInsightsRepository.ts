import prisma from "@/lib/prisma";

type ProductRow = {
  id: string;
  legacyId: string | null;
  code: string | null;
  category: string;
};

function normalizeCategory(value: string): string {
  return String(value || "").trim();
}

export type PurchaseBehaviorSnapshot = {
  hasRealData: boolean;
  topCategories: string[];
  topProductKeys: string[];
  topOfferProductKeys: string[];
};

export async function getTopPurchasedCategories(limit = 8, lookbackDays = 180): Promise<string[]> {
  const db = prisma as any;
  const max = Math.max(1, Number(limit || 8));
  const days = Math.max(30, Number(lookbackDays || 180));

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [products, orders] = await Promise.all([
      db.product.findMany({
        select: { id: true, legacyId: true, code: true, category: true },
      }),
      db.order.findMany({
        where: {
          status: { in: ["PAID", "SHIPPED"] },
          createdAt: { gte: since },
        },
        select: { items: true },
      }),
    ]);

    const byId = new Map<string, ProductRow>();
    const byLegacyId = new Map<string, ProductRow>();
    const byCode = new Map<string, ProductRow>();

    (products as ProductRow[]).forEach((p) => {
      byId.set(String(p.id), p);
      if (p.legacyId) byLegacyId.set(String(p.legacyId), p);
      if (p.code) byCode.set(String(p.code), p);
    });

    const categoryUnits = new Map<string, number>();
    for (const order of orders as Array<{ items: any }>) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const key = String(item?.productId || item?._id || item?.code || "").trim();
        if (!key) continue;
        const product = byId.get(key) || byLegacyId.get(key) || byCode.get(key);
        if (!product) continue;
        const category = normalizeCategory(product.category);
        if (!category) continue;
        const quantity = Math.max(1, Number(item?.quantity || 1));
        categoryUnits.set(category, (categoryUnits.get(category) || 0) + quantity);
      }
    }

    return Array.from(categoryUnits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([category]) => category);
  } catch {
    return [];
  }
}

export async function getPurchaseBehaviorSnapshot(
  limitCategories = 8,
  limitProducts = 12,
  lookbackDays = 180
): Promise<PurchaseBehaviorSnapshot> {
  const db = prisma as any;
  const maxCategories = Math.max(1, Number(limitCategories || 8));
  const maxProducts = Math.max(1, Number(limitProducts || 12));
  const days = Math.max(30, Number(lookbackDays || 180));

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [products, orders] = await Promise.all([
      db.product.findMany({
        select: { id: true, legacyId: true, code: true, category: true, price: true, oldPrice: true },
      }),
      db.order.findMany({
        where: {
          status: { in: ["PAID", "SHIPPED"] },
          createdAt: { gte: since },
        },
        select: { items: true },
      }),
    ]);

    const byId = new Map<string, any>();
    const byLegacyId = new Map<string, any>();
    const byCode = new Map<string, any>();
    for (const p of products as any[]) {
      byId.set(String(p.id), p);
      if (p.legacyId) byLegacyId.set(String(p.legacyId), p);
      if (p.code) byCode.set(String(p.code), p);
    }

    const categoryUnits = new Map<string, number>();
    const productUnits = new Map<string, number>();
    const offerProductUnits = new Map<string, number>();

    for (const order of orders as Array<{ items: any }>) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const key = String(item?.productId || item?._id || item?.code || "").trim();
        if (!key) continue;

        const product = byId.get(key) || byLegacyId.get(key) || byCode.get(key);
        if (!product) continue;

        const quantity = Math.max(1, Number(item?.quantity || 1));
        const category = normalizeCategory(product.category);
        if (category) categoryUnits.set(category, (categoryUnits.get(category) || 0) + quantity);

        const lookupKey = String(product.legacyId || product.code || product.id || "").trim();
        if (!lookupKey) continue;
        productUnits.set(lookupKey, (productUnits.get(lookupKey) || 0) + quantity);

        const oldPrice = Number(product.oldPrice || 0);
        const price = Number(product.price || 0);
        if (oldPrice > price && price > 0) {
          offerProductUnits.set(lookupKey, (offerProductUnits.get(lookupKey) || 0) + quantity);
        }
      }
    }

    const topCategories = Array.from(categoryUnits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCategories)
      .map(([category]) => category);

    const topProductKeys = Array.from(productUnits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxProducts)
      .map(([key]) => key);

    const topOfferProductKeys = Array.from(offerProductUnits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxProducts)
      .map(([key]) => key);

    return {
      hasRealData: topProductKeys.length > 0 || topCategories.length > 0,
      topCategories,
      topProductKeys,
      topOfferProductKeys,
    };
  } catch {
    return {
      hasRealData: false,
      topCategories: [],
      topProductKeys: [],
      topOfferProductKeys: [],
    };
  }
}
