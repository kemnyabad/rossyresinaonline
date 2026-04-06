import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getExtension(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "video/quicktime": "mov",
  };
  return map[mimeType] || "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "M?todo no permitido" });

    const session = (await getServerSession(req, res, authOptions as any)) as any;
    if (!session?.user?.email) return res.status(401).json({ error: "No autenticado" });

    const { filename, data } = (req.body || {}) as { filename?: string; data?: string };
    if (!data || typeof data !== "string") return res.status(400).json({ error: "Datos invalidos" });

    const match = data.match(/^data:([a-z]+\/[a-z0-9+.-]+);base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Formato de archivo invalido" });

    const mimeType = match[1].toLowerCase();
    const base64 = match[2];
    const ext = getExtension(mimeType);
    if (!ext) return res.status(400).json({ error: "Tipo de archivo no permitido" });

    const isVideo = mimeType.startsWith("video/");
    const buffer = Buffer.from(base64, "base64");
    const maxBytes = isVideo ? 20 * 1024 * 1024 : 8 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      return res.status(413).json({ error: isVideo ? "Video muy grande" : "Imagen muy grande" });
    }

    const rawName = String(filename || `creation_${Date.now()}.${ext}`).replace(/[^a-zA-Z0-9_.-]/g, "_");
    const finalName = rawName.endsWith(`.${ext}`) ? rawName : `${rawName}.${ext}`;
    const dir = path.join(process.cwd(), "public", "creations");
    ensureDir(dir);

    const uniqueName = `${Date.now()}_${finalName}`;
    const filePath = path.join(dir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    return res.status(201).json({
      url: `/creations/${uniqueName}`,
      mimeType,
    });
  } catch {
    return res.status(500).json({ error: "No se pudo subir el archivo" });
  }
}
