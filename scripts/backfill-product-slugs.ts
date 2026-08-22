import { PrismaClient } from '@prisma/client';
import { uniqueSlug } from '@/lib/slug';

const prisma = new PrismaClient();
const db = prisma as any;

async function main() {
  const products = await db.product.findMany({
    where: { slug: null },
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Productos sin slug: ${products.length}`);

  const taken = new Set<string>(
    (await db.product.findMany({ where: { NOT: { slug: null } }, select: { slug: true } })).map(
      (p: any) => String(p.slug)
    )
  );

  for (const product of products) {
    const slug = await uniqueSlug(product.title, async (candidate) => taken.has(candidate));
    taken.add(slug);
    await db.product.update({ where: { id: product.id }, data: { slug } });
    console.log(`  ${product.id} -> ${slug}`);
  }

  console.log('✅ Backfill completo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
