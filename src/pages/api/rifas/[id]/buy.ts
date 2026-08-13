import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { v2 as cloudinary } from "cloudinary";

class TicketsTakenError extends Error {
  takenNumbers: number[];
  constructor(takenNumbers: number[]) {
    super('Números ya no disponibles');
    this.takenNumbers = takenNumbers;
  }
}

const isUniqueConstraintViolation = (error: unknown) =>
  Boolean(error) && typeof error === 'object' && (error as any).code === 'P2002';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'POST') {
    const { numbers, quantity, buyerName, buyerEmail, buyerPhone, paymentImage } = req.body;

    if (!buyerName || !buyerPhone) {
      return res.status(400).json({ error: 'Falta información del comprador' });
    }

    if (!paymentImage) {
      return res.status(400).json({ error: 'Debes subir la captura de tu Yape o transferencia' });
    }

    try {
      const rifa = await prisma.rifa.findUnique({ where: { id } });

      if (!rifa || rifa.status !== 'ACTIVE') {
        return res.status(404).json({ error: 'Rifa no encontrada o no activa' });
      }

      const isAmphora = (rifa as any).raffleMode === 'AMPHORA';
      const requestedQuantity = isAmphora
        ? Math.max(0, Math.floor(Number(quantity)))
        : 0;

      if (isAmphora && requestedQuantity < 1) {
        return res.status(400).json({ error: 'Debes indicar cuántos tickets quieres comprar' });
      }

      const uniqueNumbers = isAmphora
        ? []
        : Array.from(new Set((Array.isArray(numbers) ? numbers : []).map(n => Number(n))));

      if (!isAmphora && uniqueNumbers.length === 0) {
        return res.status(400).json({ error: 'Debes seleccionar al menos un número' });
      }

      let numbersToReserve = uniqueNumbers;

      if (!isAmphora) {
        // Verificar que los números solicitados están disponibles
        const existingTickets = await prisma.rifaTicket.findMany({
          where: {
            rifaId: id,
            number: { in: uniqueNumbers },
            status: { not: 'AVAILABLE' },
          },
        });

        if (existingTickets.length > 0) {
          const takenNumbers = existingTickets.map(t => t.number);
          return res.status(400).json({ 
            error: 'Los números ' + takenNumbers.join(', ') + ' ya no están disponibles. Selecciona otros números.',
            takenNumbers,
          });
        }
      }

      // Subir la imagen a Cloudinary para evitar el error de columna demasiado larga
      let finalImageUrl = paymentImage;
      if (paymentImage && paymentImage.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(paymentImage, {
          folder: "rifas_payments",
          resource_type: "image",
        });
        finalImageUrl = uploadRes.secure_url;
      }

      // Generar ID de transacción para el cliente
      const transactionId = randomBytes(8).toString('hex');

      let tickets: { id: string; number: number }[] = [];

      if (isAmphora) {
        // Modo ánfora: el número inicial se calcula y reserva dentro de la misma
        // transacción para que dos compras simultáneas no obtengan el mismo rango.
        // Si aun así chocan contra el índice único (rifaId, number), se reintenta.
        const MAX_ATTEMPTS = 5;
        let attempt = 0;
        let created: { id: string; number: number }[] | null = null;

        while (attempt < MAX_ATTEMPTS && !created) {
          attempt += 1;
          try {
            created = await prisma.$transaction(async (tx) => {
              const lastTicket = await tx.rifaTicket.findFirst({
                where: { rifaId: id },
                orderBy: { number: 'desc' },
                select: { number: true },
              });
              const startNumber = (lastTicket?.number || 0) + 1;
              const reserveNumbers = Array.from({ length: requestedQuantity }, (_, index) => startNumber + index);

              const rows = [];
              for (const number of reserveNumbers) {
                const row = await tx.rifaTicket.create({
                  data: {
                    rifaId: id,
                    number,
                    status: 'PENDING',
                    buyerName,
                    buyerEmail: buyerEmail || "cliente@web.com",
                    buyerPhone,
                    paymentImage: finalImageUrl,
                  },
                });
                rows.push({ id: row.id, number: row.number });
              }
              return rows;
            });
          } catch (error) {
            if (isUniqueConstraintViolation(error) && attempt < MAX_ATTEMPTS) continue;
            throw error;
          }
        }

        if (!created) {
          return res.status(409).json({ error: 'No se pudo reservar el ánfora, intenta nuevamente.' });
        }
        tickets = created;
        numbersToReserve = tickets.map((t) => t.number);
      } else {
        // Modo números: cada reserva se confirma con una actualización condicionada
        // a status = AVAILABLE (o creación si el número nunca se pre-generó), así
        // que dos compradores no pueden pisarse el mismo número.
        const takenNumbers: number[] = [];
        const reservedTickets: { id: string; number: number }[] = [];

        try {
          await prisma.$transaction(async (tx) => {
            for (const number of numbersToReserve) {
              const updated = await tx.rifaTicket.updateMany({
                where: { rifaId: id, number, status: 'AVAILABLE' },
                data: {
                  status: 'PENDING',
                  buyerName,
                  buyerEmail: buyerEmail || "cliente@web.com",
                  buyerPhone,
                  paymentImage: finalImageUrl,
                  createdAt: new Date(),
                },
              });

              if (updated.count === 1) {
                const ticket = await tx.rifaTicket.findUnique({ where: { rifaId_number: { rifaId: id, number } } });
                if (ticket) reservedTickets.push({ id: ticket.id, number: ticket.number });
                continue;
              }

              try {
                const row = await tx.rifaTicket.create({
                  data: {
                    rifaId: id,
                    number,
                    status: 'PENDING',
                    buyerName,
                    buyerEmail: buyerEmail || "cliente@web.com",
                    buyerPhone,
                    paymentImage: finalImageUrl,
                  },
                });
                reservedTickets.push({ id: row.id, number: row.number });
              } catch {
                takenNumbers.push(number);
              }
            }

            if (takenNumbers.length > 0) {
              throw new TicketsTakenError(takenNumbers);
            }
          });
        } catch (error) {
          if (error instanceof TicketsTakenError) {
            return res.status(400).json({
              error: 'Los números ' + error.takenNumbers.join(', ') + ' ya no están disponibles. Selecciona otros números.',
              takenNumbers: error.takenNumbers,
            });
          }
          throw error;
        }

        tickets = reservedTickets;
      }

      res.status(201).json({
        success: true,
        message: isAmphora
          ? 'Tickets reservados para el ánfora. Completa el pago para finalizar tu compra.'
          : 'Números reservados. Completa el pago para finalizar tu compra.',
        transactionId,
        tickets: tickets.map(t => ({ id: t.id, number: t.number })),
        totalPrice: numbersToReserve.length * parseFloat(rifa.pricePerNumber.toString()),
      });
    } catch (error) {
      console.error('Error buying tickets:', error);
      
      // Mensaje de error más específico
      if (error instanceof Error) {
        if (error.message.includes('size')) {
          return res.status(413).json({ error: 'La imagen es demasiado grande. Máximo 10MB' });
        }
        return res.status(500).json({ error: 'Error: ' + error.message });
      }
      
      res.status(500).json({ error: 'Error al procesar la compra. Intenta nuevamente.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
