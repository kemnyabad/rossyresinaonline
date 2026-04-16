import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  // Verificar que el usuario es admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const rifa = await prisma.rifa.findUnique({
        where: { id },
        include: {
          tickets: {
            orderBy: { number: 'asc' },
          },
        },
      });

      if (!rifa) {
        return res.status(404).json({ error: 'Rifa no encontrada' });
      }

      res.json(rifa);
    } catch (error) {
      console.error('Error fetching rifa:', error);
      res.status(500).json({ error: 'Error fetching rifa' });
    }
  } else if (req.method === 'PUT') {
    const { title, description, image, totalNumbers, pricePerNumber, startDate, endDate, rules, status } =
      req.body;

    try {
      const rifa = await prisma.rifa.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(image && { image }),
          ...(totalNumbers && { totalNumbers: parseInt(totalNumbers) }),
          ...(pricePerNumber && { pricePerNumber: parseFloat(pricePerNumber) }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(rules && { rules }),
          ...(status && { status }),
        },
      });

      res.json({
        success: true,
        message: 'Rifa actualizada',
        rifa,
      });
    } catch (error) {
      console.error('Error updating rifa:', error);
      res.status(500).json({ error: 'Error updating rifa' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Eliminar todos los tickets asociados
      await prisma.rifaTicket.deleteMany({ where: { rifaId: id } });

      // Eliminar la rifa
      await prisma.rifa.delete({ where: { id } });

      res.json({ success: true, message: 'Rifa eliminada' });
    } catch (error) {
      console.error('Error deleting rifa:', error);
      res.status(500).json({ error: 'Error deleting rifa' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
