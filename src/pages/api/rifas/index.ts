import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const isPrizeImagesColumnMissing = (error: any): boolean => {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('prizeimages') && (msg.includes('does not exist') || msg.includes('unknown column'));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Lista pública de rifas ACTIVAS con información de cuántos números están vendidos
    try {
      let rifas: any[];
      try {
        rifas = await prisma.rifa.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'asc' },
        }) as any[];
      } catch (error) {
        if (!isPrizeImagesColumnMissing(error)) throw error;
        rifas = await prisma.rifa.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            videoUrl: true,
            prizes: true,
            totalNumbers: true,
            pricePerNumber: true,
            startDate: true,
            endDate: true,
            rules: true,
          } as any,
        }) as any[];
      }

      // Contar números vendidos para cada rifa
      const rifasConConteos = await Promise.all(
        rifas.map(async (rifa) => {
          const soldCount = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id, status: { not: 'AVAILABLE' } },
          });
          return {
            id: rifa.id,
            title: rifa.title,
            description: rifa.description,
            image: rifa.image,
            prizeImages: Array.isArray(rifa.prizeImages) ? rifa.prizeImages : [],
            videoUrl: rifa.videoUrl,
            prizes: rifa.prizes,
            totalNumbers: rifa.totalNumbers,
            pricePerNumber: rifa.pricePerNumber,
            startDate: rifa.startDate,
            endDate: rifa.endDate,
            rules: rifa.rules,
            soldCount,
            availableNumbers: rifa.totalNumbers - soldCount,
          };
        })
      );

      res.json(rifasConConteos);
    } catch (error) {
      console.error('Error fetching rifas:', error);
      res.status(500).json({ error: 'Error fetching rifas' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

