import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createSellerApplication } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo no permitido" });

  const session = await getServerSession(req, res, authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) return res.status(401).json({ error: "Debes iniciar sesion para enviar la solicitud." });

  const body = req.body || {};
  const required = ["fullName", "businessName", "city", "whatsapp", "productType", "description"];
  const missing = required.filter((key) => !String(body[key] || "").trim());
  if (missing.length > 0) return res.status(400).json({ error: "Completa los campos obligatorios." });

  const application = createSellerApplication({
    userEmail: email,
    fullName: body.fullName,
    businessName: body.businessName,
    city: body.city,
    whatsapp: body.whatsapp,
    productType: body.productType,
    description: body.description,
    socialUrl: body.socialUrl,
    logoUrl: body.logoUrl,
  });

  return res.status(201).json({ application });
}
