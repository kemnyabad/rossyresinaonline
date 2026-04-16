import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar que el usuario es admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const rifas = await prisma.rifa.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          tickets: {
            select: {
              id: true,
              status: true,
              number: true,
            },
          },
        },
      });

      const rifasConConteos = rifas.map((rifa) => ({
        ...rifa,
        soldCount: rifa.tickets.filter((t) => t.status === 'SOLD').length,
        paidCount: rifa.tickets.filter((t) => t.status === 'PAID').length,
        availableCount: rifa.tickets.filter((t) => t.status === 'AVAILABLE').length,
      }));

      res.json(rifasConConteos);
    } catch (error) {
      console.error('Error fetching rifas:', error);
      res.status(500).json({ error: 'Error fetching rifas' });
    }
  } else if (req.method === 'POST') {
    const { title, description, image, totalNumbers, pricePerNumber, startDate, endDate, rules } =
      req.body;

    if (!title || !totalNumbers || !pricePerNumber) {
      return res.status(400).json({ error: 'Falta información requerida' });
    }

    try {
      // Crear la rifa
      const rifa = await prisma.rifa.create({
        data: {
          title,
          description: description || '',
          image: image || '',
          totalNumbers: parseInt(totalNumbers),
          pricePerNumber: parseFloat(pricePerNumber),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rules: rules || '',
          status: 'ACTIVE',
        },
      });

      // Crear los tickets disponibles
      const tickets = await prisma.rifaTicket.createMany({
        data: Array.from({ length: parseInt(totalNumbers) }, (_, i) => ({
          rifaId: rifa.id,
          number: i + 1,
          status: 'AVAILABLE',
        })),
      });

      res.status(201).json({
        success: true,
        message: `Rifa creada con ${totalNumbers} números disponibles`,
        rifa,
        ticketsCreated: tickets.count,
      });
    } catch (error) {
      console.error('Error creating rifa:', error);
      res.status(500).json({ error: 'Error al crear la rifa' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
