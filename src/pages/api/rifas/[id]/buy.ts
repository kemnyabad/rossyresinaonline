import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { v2 as cloudinary } from "cloudinary";

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
    const { numbers, buyerName, buyerEmail, buyerPhone, paymentImage } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: 'Debes seleccionar al menos un número' });
    }

    if (!buyerName || !buyerPhone) {
      return res.status(400).json({ error: 'Falta información del comprador' });
    }

    if (!paymentImage) {
      return res.status(400).json({ error: 'Debes subir la captura de tu Yape o transferencia' });
    }

    // Limpiar duplicados y asegurar que sean números
    const uniqueNumbers = Array.from(new Set(numbers.map(n => Number(n))));

    try {
      const rifa = await prisma.rifa.findUnique({ where: { id } });

      if (!rifa || rifa.status !== 'ACTIVE') {
        return res.status(404).json({ error: 'Rifa no encontrada o no activa' });
      }

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
      
      // Usar transacción para asegurar consistencia
      const tickets = await prisma.$transaction(
        uniqueNumbers.map((number) =>
          prisma.rifaTicket.upsert({
            where: {
              rifaId_number: { rifaId: id, number },
            },
            update: {
              status: 'PENDING',
              buyerName,
              buyerEmail: buyerEmail || "cliente@web.com",
              buyerPhone,
              paymentImage: finalImageUrl, // Guardamos la URL de Cloudinary (corta)
              createdAt: new Date(),
            },
            create: {
              rifaId: id,
              number,
              status: 'PENDING',
              buyerName,
              buyerEmail: buyerEmail || "cliente@web.com",
              buyerPhone,
              paymentImage: finalImageUrl,
            },
          })
        )
      );

      res.status(201).json({
        success: true,
        message: 'Números reservados. Completa el pago para finalizar tu compra.',
        transactionId,
        tickets: tickets.map(t => ({ id: t.id, number: t.number })),
        totalPrice: uniqueNumbers.length * parseFloat(rifa.pricePerNumber.toString()),
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
