import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const db = prisma as any;

async function main() {
  const jsonPath = path.join(process.cwd(), 'scratchpad-output', 'product-descriptions-draft.json');
  const rows: Array<{ id: string; slug: string; title: string; description: string }> = JSON.parse(
    fs.readFileSync(jsonPath, 'utf8')
  );

  let applied = 0;
  let skipped = 0;
  for (const row of rows) {
    const current = await db.product.findUnique({ where: { id: row.id }, select: { description: true } });
    if (!current) {
      console.log(`  [omitido] ${row.slug}: producto ya no existe`);
      skipped += 1;
      continue;
    }
    if (String(current.description || '').trim() !== '') {
      console.log(`  [omitido] ${row.slug}: ya tiene descripción (no se sobrescribe)`);
      skipped += 1;
      continue;
    }
    await db.product.update({ where: { id: row.id }, data: { description: row.description } });
    console.log(`  [aplicado] ${row.slug}`);
    applied += 1;
  }

  console.log(`\nAplicadas: ${applied} | Omitidas: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
