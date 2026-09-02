import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

    const session = await getServerSession(req, res, authOptions);
    const email = String(session?.user?.email || "").trim().toLowerCase();
    if (!email) return res.status(401).json({ error: "Debes iniciar sesion para subir documentos." });

    const { filename, data, kind } = (req.body || {}) as any;
    if (!data || typeof data !== "string") return res.status(400).json({ error: "Datos invalidos" });
    const match = data.match(/^data:(image\/(png|jpe?g|webp));base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Formato de imagen invalido" });

    const ext = match[2].toLowerCase() === "jpeg" ? "jpg" : match[2].toLowerCase();
    const buf = Buffer.from(match[3], "base64");
    if (buf.length > 1200 * 1024) return res.status(413).json({ error: "Imagen muy grande. Maximo 1.2MB." });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Cloudinary no esta configurado." });
    }

    const safeName = String(filename || `documento.${ext}`).replace(/[^a-zA-Z0-9_\-.]/g, "_");
    const baseName = safeName.replace(/\.[a-z0-9]+$/i, "");
    const safeKind = String(kind || "seller").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const emailHash = crypto.createHash("sha256").update(email).digest("hex").slice(0, 12);
    const publicId = `${safeKind}_${emailHash}_${baseName}_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const upload = await cloudinary.uploader.upload(data, {
      folder: "seller-verification",
      resource_type: "image",
      public_id: publicId,
      overwrite: false,
    });

    const url = String(upload.secure_url || "").trim();
    if (!url) return res.status(500).json({ error: "Cloudinary no devolvio URL segura" });
    return res.status(201).json({ url });
  } catch (error: any) {
    return res.status(500).json({ error: String(error?.message || "No se pudo subir la imagen") });
  }
}
