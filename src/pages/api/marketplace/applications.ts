import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createSellerApplication } from "@/lib/marketplaceStore";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

    const session = await getServerSession(req, res, authOptions);
    const email = String(session?.user?.email || "").trim().toLowerCase();
    if (!email) return res.status(401).json({ error: "Debes iniciar sesion para enviar la solicitud." });

    const body = req.body || {};
    const required = ["fullName", "sellerDni", "businessName", "city", "whatsapp", "productType", "description", "dniFrontUrl", "dniBackUrl", "businessPhotoUrl"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (missing.length > 0) return res.status(400).json({ error: "Completa los campos obligatorios." });
    const sellerDni = String(body.sellerDni || "").replace(/\D/g, "");
    if (sellerDni.length < 8) return res.status(400).json({ error: "Ingresa un DNI valido." });

    const application = await createSellerApplication({
      userEmail: email,
      fullName: String(body.fullName || "").trim(),
      sellerDni,
      businessName: String(body.businessName || "").trim(),
      city: String(body.city || "").trim(),
      whatsapp: String(body.whatsapp || "").trim(),
      productType: String(body.productType || "").trim(),
      description: String(body.description || "").trim(),
      socialUrl: String(body.socialUrl || "").trim(),
      logoUrl: String(body.logoUrl || "").trim(),
      dniFrontUrl: String(body.dniFrontUrl || "").trim(),
      dniBackUrl: String(body.dniBackUrl || "").trim(),
      businessPhotoUrl: String(body.businessPhotoUrl || "").trim(),
    });

    return res.status(201).json({ application });
  } catch (error: any) {
    return res.status(500).json({ error: "No se pudo enviar la solicitud. Intenta nuevamente." });
  }
}
