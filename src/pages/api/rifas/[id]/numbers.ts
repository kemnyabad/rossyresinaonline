import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    const { status = 'AVAILABLE', page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    try {
      const rifa = await prisma.rifa.findUnique({
        where: { id },
      });

      if (!rifa) {
        return res.status(404).json({ error: 'Rifa no encontrada' });
      }

      const tickets = await prisma.rifaTicket.findMany({
        where: { rifaId: id, status: status as string },
        orderBy: { number: 'asc' },
        skip,
        take: parseInt(limit as string),
        select: { 
          id: true, 
          number: true, 
          status: true,
          buyerName: true,
          buyerEmail: true,
        },
      });

      const total = await prisma.rifaTicket.count({
        where: { rifaId: id, status: status as string },
      });

      res.json({ 
        tickets, 
        total, 
        page: parseInt(page as string), 
        limit: parseInt(limit as string),
        rifa: {
          id: rifa.id,
          title: rifa.title,
          totalNumbers: rifa.totalNumbers,
          pricePerNumber: rifa.pricePerNumber,
        },
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Error fetching tickets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

