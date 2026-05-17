import { ensureAdminFromEnv } from '@/lib/users';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creando admin...');
  
  // Ensure .env vars
  if (!process.env.ADMIN_EMAILS || !process.env.ADMIN_PASSWORD) {
    console.error('❌ Set .env:\nADMIN_EMAILS=tu@email.com\nADMIN_PASSWORD=123456');
    process.exit(1);
  }
  
  await ensureAdminFromEnv();
  
  const adminEmail = process.env.ADMIN_EMAILS!.split(',')[0].trim();
  console.log(`✅ Admin creado: ${adminEmail}`);
  console.log('Login: /admin/sign-in');
  console.log('Usa: npm run create-admin');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

