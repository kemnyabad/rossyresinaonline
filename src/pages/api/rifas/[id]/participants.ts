import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const displayName = (name?: string | null) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Participante';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const tickets = await prisma.rifaTicket.findMany({
      where: {
        rifaId: id,
        status: { in: ['PENDING', 'PAID', 'SOLD'] },
        buyerName: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 36,
      select: {
        buyerName: true,
      },
    });

    return res.status(200).json({
      participants: tickets.map((ticket) => displayName(ticket.buyerName)),
    });
  } catch (error) {
    console.error('Error fetching rifa participants:', error);
    return res.status(500).json({ error: 'Error fetching participants' });
  }
}
