import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminApiRequest } from "@/lib/adminAuth";
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
      sizeLimit: '50mb',
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
  const { id } = req.query as { id: string };
  if (!isAdminApiRequest(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      let rifa: any;
      try {
        rifa = await prisma.rifa.findUnique({
          where: { id },
          include: { _count: { select: { tickets: true } } }
        });
      } catch (error) {
        if (!isPrizeImagesColumnMissing(error) && !isRaffleModeColumnMissing(error)) throw error;
        rifa = await prisma.rifa.findUnique({
          where: { id },
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
            _count: { select: { tickets: true } },
          } as any,
        });
      }

      if (!rifa) return res.status(404).json({ error: 'Rifa no encontrada' });
      if (!Array.isArray(rifa.prizeImages)) rifa.prizeImages = [];
      rifa.raffleMode = rifa.raffleMode || 'NUMBERS';
      return res.status(200).json(rifa);
    } catch (error) {
      console.error('Error al obtener rifa:', error);
      return res.status(500).json({ error: 'Error al obtener la rifa' });
    }
  }

  if (req.method === 'PUT') {
    const { 
      title, description, pricePerNumber, raffleMode, startDate, 
      endDate, rules, image, videoUrl, prizes, status, prizeImages
    } = req.body;

    try {
      let finalImage = image;
      let finalVideo = videoUrl;

      if (image && image.startsWith('data:image')) {
        const res = await cloudinary.uploader.upload(image, { folder: "rifas" });
        finalImage = res.secure_url;
      }

      if (videoUrl && videoUrl.startsWith('data:video')) {
        const res = await cloudinary.uploader.upload(videoUrl, { 
          folder: "rifas_videos", 
          resource_type: "video" 
        });
        finalVideo = res.secure_url;
      }

      let updated: any;
      try {
        updated = await prisma.rifa.update({
          where: { id },
          data: {
            title,
            description,
            pricePerNumber: parseFloat(String(pricePerNumber)),
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            rules,
            image: finalImage,
            prizeImages: normalizePrizeImages(prizeImages),
            videoUrl: finalVideo,
            prizes,
            raffleMode: raffleMode === 'AMPHORA' ? 'AMPHORA' : 'NUMBERS',
            status: status || undefined,
          } as any,
        });
      } catch (error: any) {
        if (!isPrizeImagesColumnMissing(error) && !isRaffleModeColumnMissing(error)) throw error;
        updated = await prisma.rifa.update({
          where: { id },
          data: {
            title,
            description,
            pricePerNumber: parseFloat(String(pricePerNumber)),
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            rules,
            image: finalImage,
            videoUrl: finalVideo,
            prizes,
            status: status || undefined,
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

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Update error:', error);
      return res.status(500).json({
        error: 'No se pudo actualizar el sorteo',
        detail: String((error as any)?.message || ''),
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Eliminar primero todos los tickets asociados
      await prisma.rifaTicket.deleteMany({
        where: { rifaId: id },
      });

      // Luego eliminar la rifa
      await prisma.rifa.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Rifa eliminada correctamente' });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'No se pudo eliminar la rifa' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
