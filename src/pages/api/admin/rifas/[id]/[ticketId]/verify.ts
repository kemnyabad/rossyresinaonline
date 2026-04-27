import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, ticketId } = req.query as { id: string; ticketId: string };

  // Verificar que el usuario es admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'PUT') {
    const { action } = req.body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    try {
      // Verificar que el ticket existe y pertenece a la rifa
      const ticket = await prisma.rifaTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket || ticket.rifaId !== id) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }

      if (ticket.status !== 'PAID') {
        return res.status(400).json({ error: 'El ticket no está en estado PAID' });
      }

      if (action === 'approve') {
        // Confirmar el pago
        const updatedTicket = await prisma.rifaTicket.update({
          where: { id: ticketId },
          data: {
            status: 'CONFIRMED',
          },
        });

        res.json({
          success: true,
          message: 'Pago confirmado',
          ticket: updatedTicket,
        });
      } else if (action === 'reject') {
        // Rechazar el pago y volver a AVAILABLE
        const updatedTicket = await prisma.rifaTicket.update({
          where: { id: ticketId },
          data: {
            status: 'AVAILABLE',
            buyerName: null,
            buyerEmail: null,
            buyerPhone: null,
            paymentImage: null,
          },
        });

        res.json({
          success: true,
          message: 'Pago rechazado, número vuelto a disponibilidad',
          ticket: updatedTicket,
        });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ error: 'Error updating ticket status' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
