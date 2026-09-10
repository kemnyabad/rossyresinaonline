const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRifa() {
  try {
    const updated = await prisma.rifa.update({
      where: { id: 'cmo0mbeow000113zf9cd5koec' },
      data: {
        prizes: '✨ 1 juego de vasos\n✨ 1 plancha de cabello\n✨ 1 parlante Bluetooth',
      },
    });
    
    console.log('✅ Rifa actualizada:');
    console.log(`  Prizes: ${updated.prizes}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateRifa();
