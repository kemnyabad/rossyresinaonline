import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Lista pública de rifas ACTIVAS con información de cuántos números están vendidos
    try {
      const rifas = await prisma.rifa.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          totalNumbers: true,
          pricePerNumber: true,
          startDate: true,
          endDate: true,
          rules: true,
        },
      });

      // Contar números vendidos para cada rifa
      const rifasConConteos = await Promise.all(
        rifas.map(async (rifa) => {
          const soldCount = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id, status: { not: 'AVAILABLE' } },
          });
          return {
            ...rifa,
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

