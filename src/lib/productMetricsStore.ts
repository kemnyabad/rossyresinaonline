import prisma from "@/lib/prisma";

const db = prisma as any;

export async function recordCartAdd(productId: string, quantity: number): Promise<number> {
  const metric = await db.productMetric.upsert({
    where: { productId },
    update: { cartAdds: { increment: quantity } },
    create: { productId, cartAdds: quantity },
  });
  return metric.cartAdds;
}
