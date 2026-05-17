import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, ticketId } = req.query as { id: string; ticketId: string };

  if (req.method === 'PUT') {
    const { paymentImage } = req.body;

    if (!paymentImage) {
      return res.status(400).json({ error: 'Imagen de pago requerida' });
    }

    try {
      // Verificar que el ticket existe y pertenece a la rifa
      const ticket = await prisma.rifaTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket || ticket.rifaId !== id) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }

      // Actualizar el ticket con la imagen de pago y cambiar estado a PAID
      const updatedTicket = await prisma.rifaTicket.update({
        where: { id: ticketId },
        data: {
          paymentImage,
          status: 'PAID',
        },
      });

      res.json({
        success: true,
        message: 'Pago registrado correctamente. El admin verificará tu comprobante.',
        ticket: updatedTicket,
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Error al registrar el pago' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
