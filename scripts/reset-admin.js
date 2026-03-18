const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const email = 'administrador@rossyresina.com';
  const pass = 'AD_2026@rr';
  const passwordHash = await bcrypt.hash(pass, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'ADMIN', name: existing.name || 'Administrador' },
    });
    console.log('updated');
  } else {
    await prisma.user.create({
      data: { email, name: 'Administrador', passwordHash, role: 'ADMIN' },
    });
    console.log('created');
  }
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
