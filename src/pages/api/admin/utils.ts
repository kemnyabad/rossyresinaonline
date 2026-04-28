import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminApiRequest } from "@/lib/adminAuth";
import prisma from '@/lib/prisma';

/**
 * API de Utilidades para Admin - Gestión de Rifas
 * Endpoints:
 * - GET /api/admin/utils/rifa-status: Ver estado de todas las rifas
 * - POST /api/admin/utils/rifa-fix: Reparar números faltantes
 * - POST /api/admin/utils/set-ticket-status: Cambiar estado de número
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminApiRequest(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { action } = req.query;

  // GET - Ver estado de rifas
  if (req.method === 'GET' && action === 'status') {
    try {
      const rifas = await prisma.rifa.findMany({
        select: { id: true, title: true, totalNumbers: true, status: true, raffleMode: true },
      });

      const status = await Promise.all(
        rifas.map(async (rifa) => {
          const isAmphora = (rifa as any).raffleMode === 'AMPHORA';
          const available = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id, status: 'AVAILABLE' },
          });
          const pending = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id, status: 'PENDING' },
          });
          const sold = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id, status: 'SOLD' },
          });
          const paid = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id, status: 'PAID' },
          });
          const totalCreated = await prisma.rifaTicket.count({
            where: { rifaId: rifa.id },
          });
          const participationTotal = pending + sold + paid;

          return {
            id: rifa.id,
            title: rifa.title,
            raffleMode: (rifa as any).raffleMode || 'NUMBERS',
            status: rifa.status,
            expectedTotal: isAmphora ? participationTotal : rifa.totalNumbers,
            actualTotal: isAmphora ? participationTotal : totalCreated,
            available: isAmphora ? 0 : available,
            pending,
            sold,
            paid,
            missing: isAmphora ? 0 : rifa.totalNumbers - totalCreated,
          };
        })
      );

      return res.json({
        success: true,
        rifas: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching status:', error);
      return res.status(500).json({ error: 'Error al obtener estado' });
    }
  }

  // GET - Conteo liviano para notificaciones del panel admin
  if (req.method === 'GET' && action === 'pending-count') {
    try {
      const pendingTickets = await prisma.rifaTicket.findMany({
        where: { status: 'PENDING' },
        select: {
          rifaId: true,
          buyerName: true,
          buyerPhone: true,
          paymentImage: true,
          rifa: { select: { title: true, raffleMode: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const grouped = pendingTickets.reduce((acc: Record<string, any>, ticket: any) => {
        const key = `${ticket.rifaId}-${ticket.buyerName || 'Unknown'}-${ticket.buyerPhone || ''}`;
        if (!acc[key]) {
          acc[key] = {
            rifaId: ticket.rifaId,
            rifaTitle: ticket.rifa?.title || '',
            raffleMode: ticket.rifa?.raffleMode || 'NUMBERS',
            buyerName: ticket.buyerName,
            buyerPhone: ticket.buyerPhone,
            paymentImage: ticket.paymentImage,
            ticketCount: 0,
          };
        }
        acc[key].ticketCount += 1;
        return acc;
      }, {});

      return res.json({
        success: true,
        pendingPayments: Object.values(grouped).length,
        pendingTickets: pendingTickets.length,
        items: Object.values(grouped).slice(0, 5),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching pending count:', error);
      return res.status(500).json({ error: 'Error al obtener pendientes' });
    }
  }

  // POST - Reparar números faltantes
  if (req.method === 'POST' && action === 'fix-missing') {
    const { rifaId } = req.body;

    if (!rifaId) {
      return res.status(400).json({ error: 'rifaId requerido' });
    }

    try {
      const rifa = await prisma.rifa.findUnique({ where: { id: rifaId } });
      if (!rifa) {
        return res.status(404).json({ error: 'Rifa no encontrada' });
      }

      if ((rifa as any).raffleMode === 'AMPHORA') {
        return res.json({
          success: true,
          message: 'Esta modalidad es ánfora y no usa cartilla de números.',
          createdCount: 0,
        });
      }

      const existentes = await prisma.rifaTicket.findMany({
        where: { rifaId },
        select: { number: true },
      });

      const existentesSet = new Set(existentes.map(t => t.number));
      const faltantes = Array.from({ length: rifa.totalNumbers }, (_, i) => i + 1).filter(
        n => !existentesSet.has(n)
      );

      if (faltantes.length === 0) {
        return res.json({
          success: true,
          message: 'No hay números faltantes',
          createdCount: 0,
        });
      }

      const resultado = await prisma.rifaTicket.createMany({
        data: faltantes.map(number => ({
          rifaId,
          number,
          status: 'AVAILABLE',
        })),
        skipDuplicates: true,
      });

      return res.json({
        success: true,
        message: `Se crearon ${resultado.count} números faltantes`,
        createdCount: resultado.count,
        missingNumbers: faltantes,
        rifaTitle: rifa.title,
      });
    } catch (error) {
      console.error('Error fixing:', error);
      return res.status(500).json({ error: 'Error al reparar' });
    }
  }

  // POST - Cambiar estado de número
  if (req.method === 'POST' && action === 'set-status') {
    const { rifaId, number, newStatus } = req.body;

    if (!rifaId || !number || !newStatus) {
      return res.status(400).json({ error: 'Parámetros incompletos' });
    }

    try {
      const ticket = await prisma.rifaTicket.update({
        where: { rifaId_number: { rifaId, number } },
        data: { status: newStatus },
      });

      return res.json({
        success: true,
        message: `Número #${number} cambiado a ${newStatus}`,
        ticket,
      });
    } catch (error) {
      console.error('Error setting status:', error);
      return res.status(500).json({ error: 'Error al cambiar estado' });
    }
  }

  // GET - Obtener lista de comprobantes pendientes y pagados
  if (req.method === 'GET' && action === 'tickets') {
    try {
      const { rifaId, status: statusFilter } = req.query;
      
      const where: any = {};
      if (rifaId) where.rifaId = rifaId as string;
      if (statusFilter) where.status = statusFilter as string;
      else where.status = { in: ['PENDING', 'PAID', 'SOLD'] };

      const tickets = await prisma.rifaTicket.findMany({
        where,
        include: {
          rifa: { select: { title: true, raffleMode: true } }
        },
        orderBy: [{ createdAt: 'desc' }, { number: 'asc' }],
      });

      // Agrupar por transacción/comprador
      const grouped = tickets.reduce((acc: any, ticket: any) => {
        const key = `${ticket.rifaId}-${ticket.buyerName || 'Unknown'}`;
        if (!acc[key]) {
          acc[key] = {
            rifaId: ticket.rifaId,
            rifaTitle: ticket.rifa?.title,
            raffleMode: ticket.rifa?.raffleMode || 'NUMBERS',
            buyerName: ticket.buyerName,
            buyerPhone: ticket.buyerPhone,
            buyerEmail: ticket.buyerEmail,
            paymentImage: ticket.paymentImage,
            status: ticket.status,
            createdAt: ticket.createdAt,
            numbers: [],
            ticketCount: 0,
          };
        }
        acc[key].numbers.push(ticket.number);
        acc[key].ticketCount += 1;
        return acc;
      }, {});

      return res.json({
        success: true,
        tickets: Object.values(grouped),
        count: Object.values(grouped).length,
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({ error: 'Error al obtener comprobantes' });
    }
  }

  res.status(400).json({ error: 'Acción no válida' });
}
