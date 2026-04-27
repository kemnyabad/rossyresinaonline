import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Aumentado para soportar videos pesados
    },
  },
};

const isPrizeImagesColumnMissing = (error: any): boolean => {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('prizeimages') && (
    msg.includes('does not exist') ||
    msg.includes('unknown column') ||
    msg.includes('unknown arg') ||
    msg.includes('unknown argument')
  );
};

const isRaffleModeColumnMissing = (error: any): boolean => {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('rafflemode') && (
    msg.includes('does not exist') ||
    msg.includes('unknown column') ||
    msg.includes('unknown arg') ||
    msg.includes('unknown argument')
  );
};

const normalizePrizeImages = (raw: any): Array<{ url: string; alt: string }> => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      if (typeof item === 'string') {
        const url = item.trim();
        return url ? { url, alt: 'Premio de la rifa' } : null;
      }
      const url = String(item?.url || '').trim();
      if (!url) return null;
      const alt = String(item?.alt || 'Premio de la rifa').trim();
      return { url, alt };
    })
    .filter(Boolean) as Array<{ url: string; alt: string }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar que el usuario es admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      let rifas: any[];
      try {
        rifas = await prisma.rifa.findMany({
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
      } catch (error) {
        if (!isPrizeImagesColumnMissing(error) && !isRaffleModeColumnMissing(error)) throw error;
        rifas = await prisma.rifa.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            videoUrl: true,
            prizes: true,
            totalNumbers: true,
            pricePerNumber: true,
            startDate: true,
            endDate: true,
            status: true,
            rules: true,
            createdAt: true,
            updatedAt: true,
            tickets: {
              select: {
                id: true,
                status: true,
                number: true,
              },
            },
          } as any,
        });
      }

      const rifasConConteos = rifas.map((rifa) => ({
        ...rifa,
        prizeImages: Array.isArray(rifa.prizeImages) ? rifa.prizeImages : [],
        raffleMode: rifa.raffleMode || 'NUMBERS',
        soldCount: rifa.tickets.filter((t: any) => t.status === 'SOLD').length,
        paidCount: rifa.tickets.filter((t: any) => t.status === 'PAID').length,
        availableCount: rifa.tickets.filter((t: any) => t.status === 'AVAILABLE').length,
      }));

      res.json(rifasConConteos);
    } catch (error) {
      console.error('Error fetching rifas:', error);
      res.status(500).json({ error: 'Error fetching rifas' });
    }
  } else if (req.method === 'POST') {
    const { 
      title, 
      description, 
      image, 
      videoUrl, 
      prizeImages,
      prizes, 
      raffleMode,
      totalNumbers, 
      pricePerNumber, 
      startDate, 
      endDate, 
      rules,
      status 
    } = req.body;

    const normalizedRaffleMode = raffleMode === 'AMPHORA' ? 'AMPHORA' : 'NUMBERS';
    const normalizedTotalNumbers = normalizedRaffleMode === 'AMPHORA' ? 0 : parseInt(totalNumbers);

    if (!title || (normalizedRaffleMode === 'NUMBERS' && !totalNumbers) || !pricePerNumber) {
      return res.status(400).json({ error: 'Falta información requerida' });
    }

    try {
      // Subir archivos a Cloudinary en paralelo para optimizar tiempo
      const [uploadImage, uploadVideo] = await Promise.all([
        image && image.startsWith('data:image') 
          ? cloudinary.uploader.upload(image, { folder: "rifas" })
          : Promise.resolve({ secure_url: image }),
        videoUrl && videoUrl.startsWith('data:video')
          ? cloudinary.uploader.upload(videoUrl, { folder: "rifas_videos", resource_type: "video" })
          : Promise.resolve({ secure_url: videoUrl })
      ]);

      // Crear la rifa
      let rifa: any;
      try {
        rifa = await prisma.rifa.create({
          data: {
            title,
            description: description || '',
            image: uploadImage?.secure_url || '',
            prizeImages: normalizePrizeImages(prizeImages),
            videoUrl: uploadVideo?.secure_url || '',
            prizes: prizes || '',
            raffleMode: normalizedRaffleMode,
            totalNumbers: normalizedTotalNumbers,
            pricePerNumber: parseFloat(pricePerNumber),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            rules: rules || '',
            status: status || 'DRAFT', // Use status from body, default to DRAFT if not provided
          } as any,
        });
      } catch (error: any) {
        if (!isPrizeImagesColumnMissing(error) && !isRaffleModeColumnMissing(error)) throw error;
        rifa = await prisma.rifa.create({
          data: {
            title,
            description: description || '',
            image: uploadImage?.secure_url || '',
            videoUrl: uploadVideo?.secure_url || '',
            prizes: prizes || '',
            totalNumbers: normalizedTotalNumbers,
            pricePerNumber: parseFloat(pricePerNumber),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            rules: rules || '',
            status: status || 'DRAFT',
          },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            videoUrl: true,
            prizes: true,
            totalNumbers: true,
            pricePerNumber: true,
            startDate: true,
            endDate: true,
            status: true,
            rules: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }

      // Crear tickets disponibles solo para rifas con cartilla. En ánfora no hay tope.
      const tickets = normalizedRaffleMode === 'AMPHORA'
        ? { count: 0 }
        : await prisma.rifaTicket.createMany({
            data: Array.from({ length: normalizedTotalNumbers }, (_, i) => ({
              rifaId: rifa.id,
              number: i + 1,
              status: 'AVAILABLE',
            })),
          });

      res.status(201).json({
        success: true,
        message: normalizedRaffleMode === 'AMPHORA'
          ? 'Rifa por ánfora creada sin límite de tickets'
          : `Rifa creada con ${totalNumbers} números disponibles`,
        rifa,
        ticketsCreated: tickets.count,
      });
    } catch (error) {
      console.error('Error creating rifa:', error);
      res.status(500).json({
        error: 'Error al crear la rifa',
        detail: String((error as any)?.message || ''),
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
