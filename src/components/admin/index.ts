import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch only active rifas for the public page
      const rifas = await prisma.rifa.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          // Count tickets that are not 'AVAILABLE' to represent sold/pending/paid numbers
          _count: {
            select: { tickets: { where: { status: { in: ['SOLD', 'PAID', 'PENDING'] } } } },
          },
        },
      });

      const rifasWithCounts = rifas.map((rifa) => ({
        ...rifa,
        soldCount: rifa._count.tickets, // Represents numbers reserved, sold, or paid
        availableCount: rifa.totalNumbers - rifa._count.tickets,
      }));

      res.status(200).json(rifasWithCounts);
    } catch (error) {
      console.error('Error fetching public rifas:', error);
      res.status(500).json({ error: 'Error al obtener las rifas' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}