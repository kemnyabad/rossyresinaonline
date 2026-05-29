import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getSellerContext, getSellerStats, readMarketplace, updateSellerShop } from "@/lib/marketplaceStore";
import prisma from "@/lib/prisma";

function safeParseMessage(value: string) {
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
}

function mapDbApplication(row: any) {
  const meta = safeParseMessage(row?.mensaje);
  const estado = String(row?.estado || "PENDIENTE").toUpperCase();
  const status = estado === "APROBADO" || estado === "APPROVED"
    ? "APPROVED"
    : estado === "RECHAZADO" || estado === "REJECTED"
      ? "REJECTED"
      : "PENDING";

  return {
    id: `db_${row.id}`,
    userEmail: String(row.email || ""),
    fullName: String(row.nombre || ""),
    businessName: String(meta.emprendimiento || row.nombre || ""),
    city: String(meta.ciudad || ""),
    whatsapp: String(meta.whatsapp || row.telefono || ""),
    productType: String(meta.productos || ""),
    description: String(meta.descripcion || ""),
    socialUrl: String(meta.redes || ""),
    logoUrl: String(meta.logo || ""),
    status,
    note: String(row.notaAdmin || ""),
    createdAt: row.createdAt?.toISOString?.() || String(row.createdAt || ""),
    updatedAt: row.updatedAt?.toISOString?.() || String(row.updatedAt || ""),
    storage: "database",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const context = getSellerContext(email);
    const data = readMarketplace();
    const dbApplicationRow = await (prisma as any).capacitacionInscripcion.findFirst({
      where: { email, curso: "VENDE_CON_NOSOTROS" },
      orderBy: { createdAt: "desc" },
    });
    const dbApplication = dbApplicationRow ? mapDbApplication(dbApplicationRow) : null;
    const application = context.application || dbApplication;
    const role = context.role === "SELLER" || application?.status === "APPROVED" ? "SELLER" : "CUSTOMER";
    const syntheticShop = application?.status === "APPROVED"
      ? {
          id: `dbshop_${application.id}`,
          userEmail: email,
          slug: String(application.businessName || "mi-tienda").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          logoUrl: application.logoUrl || "",
          commercialName: application.businessName || "Mi emprendimiento",
          city: application.city || "",
          description: application.description || "",
          whatsapp: application.whatsapp || "",
          facebook: "",
          instagram: application.socialUrl || "",
          tiktok: "",
          status: "ACTIVE",
          storage: "database",
        }
      : null;
    const shop = context.shop || syntheticShop;
    const products = context.shop ? data.products.filter((item) => item.shopId === context.shop?.id) : [];
    return res.status(200).json({
      role,
      application,
      shop,
      products,
      stats: getSellerStats(context.shop?.id),
    });
  }

  if (req.method === "PUT") {
    const shop = updateSellerShop(email, req.body || {});
    if (!shop) return res.status(403).json({ error: "Tu tienda aun no esta activa." });
    return res.status(200).json({ shop });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
