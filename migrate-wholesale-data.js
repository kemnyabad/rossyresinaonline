// Migracion de datos unica: mueve src/data/wholesale-users.json (fs) hacia el
// modelo Prisma WholesaleUser. Idempotente (upsert por id/telefono normalizado).
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'wholesale-users.json');
  if (!fs.existsSync(filePath)) {
    console.log('No hay src/data/wholesale-users.json, nada que migrar.');
    return;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const users = Array.isArray(raw.users) ? raw.users : [];

  for (const user of users) {
    await prisma.wholesaleUser.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name || '',
        business: user.business || '',
        phone: user.phone || '',
        city: user.city || '',
        channel: user.channel || '',
        volume: user.volume || '',
        passwordHash: user.passwordHash,
        status: user.status || 'ACTIVE',
        createdAt: new Date(user.createdAt || Date.now()),
        updatedAt: new Date(user.updatedAt || Date.now()),
      },
    });
  }
  console.log(`Usuarios mayoristas importados: ${users.length}`);
}

main()
  .catch((error) => {
    console.error('Error en la migracion:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
