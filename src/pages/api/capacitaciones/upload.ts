import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

    const session = (await getServerSession(req, res, authOptions as any)) as any;
    if (!session?.user?.email) return res.status(401).json({ error: "No autenticado" });

    const { data } = (req.body || {}) as { filename?: string; data?: string };
    if (!data || typeof data !== "string") return res.status(400).json({ error: "Datos invalidos" });

    const match = data.match(/^data:([a-z]+\/[a-z0-9+.-]+);base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Formato de archivo invalido" });

    const mimeType = match[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(400).json({ error: "Tipo de archivo no permitido" });
    }

    const isVideo = mimeType.startsWith("video/");
    const base64Length = match[2].length;
    const approxBytes = Math.floor((base64Length * 3) / 4);
    const maxBytes = isVideo ? 20 * 1024 * 1024 : 8 * 1024 * 1024;
    if (approxBytes > maxBytes) {
      return res.status(413).json({ error: isVideo ? "Video muy grande" : "Imagen muy grande" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ error: "Credenciales de Cloudinary no configuradas" });
    }

    const uploadResult = await cloudinary.uploader.upload(data, {
      folder: "capacitaciones_creations",
      resource_type: isVideo ? "video" : "image",
    });

    return res.status(201).json({
      url: uploadResult.secure_url,
      mimeType,
    });
  } catch {
    return res.status(500).json({ error: "No se pudo subir el archivo" });
  }
}
