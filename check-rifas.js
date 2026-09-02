const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRifas() {
  try {
    const rifas = await prisma.rifa.findMany();
    console.log('Total rifas en DB:', rifas.length);
    rifas.forEach(r => {
      console.log(`\n[${r.id}] ${r.title}`);
      console.log(`  Status: ${r.status}`);
      console.log(`  VideoUrl: ${r.videoUrl ? 'SÍ' : 'NO'}`);
      console.log(`  Prizes: ${r.prizes ? 'SÍ' : 'NO'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRifas();
