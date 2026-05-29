import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createSellerApplication } from "@/lib/marketplaceStore";
import prisma from "@/lib/prisma";

async function createDatabaseFallbackApplication(input: {
  email: string;
  fullName: string;
  businessName: string;
  city: string;
  whatsapp: string;
  productType: string;
  description: string;
  socialUrl: string;
  logoUrl: string;
}) {
  const payload = {
    tipo: "VENDE_CON_NOSOTROS",
    emprendimiento: input.businessName,
    ciudad: input.city,
    whatsapp: input.whatsapp,
    productos: input.productType,
    descripcion: input.description,
    redes: input.socialUrl,
    logo: input.logoUrl,
  };

  return (prisma as any).capacitacionInscripcion.create({
    data: {
      nombre: input.fullName,
      email: input.email,
      telefono: input.whatsapp,
      curso: "VENDE_CON_NOSOTROS",
      nivel: "Marketplace",
      mensaje: JSON.stringify(payload),
      estado: "PENDIENTE",
    },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

    const session = await getServerSession(req, res, authOptions);
    const email = String(session?.user?.email || "").trim().toLowerCase();
    if (!email) return res.status(401).json({ error: "Debes iniciar sesion para enviar la solicitud." });

    const body = req.body || {};
    const required = ["fullName", "businessName", "city", "whatsapp", "productType", "description"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (missing.length > 0) return res.status(400).json({ error: "Completa los campos obligatorios." });

    const payload = {
      email,
      fullName: body.fullName,
      businessName: body.businessName,
      city: body.city,
      whatsapp: body.whatsapp,
      productType: body.productType,
      description: body.description,
      socialUrl: body.socialUrl,
      logoUrl: body.logoUrl,
    };

    let application: any = null;
    try {
      application = createSellerApplication({
        userEmail: email,
        ...payload,
      });
    } catch {
      const saved = await createDatabaseFallbackApplication(payload);
      application = {
        id: saved.id,
        userEmail: email,
        fullName: payload.fullName,
        businessName: payload.businessName,
        city: payload.city,
        whatsapp: payload.whatsapp,
        productType: payload.productType,
        description: payload.description,
        socialUrl: payload.socialUrl,
        logoUrl: payload.logoUrl,
        status: "PENDING",
        createdAt: saved.createdAt,
        storage: "database",
      };
    }

    return res.status(201).json({ application });
  } catch (error: any) {
    return res.status(500).json({ error: "No se pudo enviar la solicitud. Intenta nuevamente." });
  }
}
