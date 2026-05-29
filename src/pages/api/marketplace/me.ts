import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getSellerContext, getSellerStats, readMarketplace, updateSellerShop } from "@/lib/marketplaceStore";
import prisma from "@/lib/prisma";
import { mapDbApplication, mapDbProduct, mapDbShopFromApplication, safeParseMarketplaceMessage } from "@/lib/marketplaceDb";

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
    const syntheticShop = application?.status === "APPROVED" ? mapDbShopFromApplication(application) : null;
    const shop = context.shop || syntheticShop;
    const localProducts = context.shop ? data.products.filter((item) => item.shopId === context.shop?.id) : [];
    const dbProductRows = await (prisma as any).capacitacionInscripcion.findMany({
      where: { email, curso: "MARKETPLACE_PRODUCT" },
      orderBy: { createdAt: "desc" },
    });
    const dbProducts = dbProductRows.map(mapDbProduct);
    const products = [...dbProducts, ...localProducts];
    const stats = {
      ...getSellerStats(context.shop?.id),
      published: products.filter((item: any) => item.status === "PUBLISHED").length,
      pending: products.filter((item: any) => item.status === "PENDING").length,
    };
    return res.status(200).json({
      role,
      application,
      shop,
      products,
      stats,
    });
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    if (String(body.storage || "") === "database" || String(body.id || "").startsWith("dbshop_")) {
      const row = await (prisma as any).capacitacionInscripcion.findFirst({
        where: { email, curso: "VENDE_CON_NOSOTROS" },
        orderBy: { createdAt: "desc" },
      });
      if (!row) return res.status(403).json({ error: "Tu tienda aun no esta activa." });
      const current = safeParseMarketplaceMessage(row.mensaje);
      const next = {
        ...current,
        emprendimiento: String(body.commercialName ?? current.emprendimiento ?? ""),
        ciudad: String(body.city ?? current.ciudad ?? ""),
        descripcion: String(body.description ?? current.descripcion ?? ""),
        whatsapp: String(body.whatsapp ?? current.whatsapp ?? ""),
        redes: String(body.instagram ?? current.redes ?? ""),
        facebook: String(body.facebook ?? current.facebook ?? ""),
        tiktok: String(body.tiktok ?? current.tiktok ?? ""),
        logo: String(body.logoUrl ?? current.logo ?? ""),
      };
      await (prisma as any).capacitacionInscripcion.update({
        where: { id: row.id },
        data: {
          nombre: String(body.commercialName || row.nombre),
          telefono: String(body.whatsapp || row.telefono || ""),
          mensaje: JSON.stringify(next),
        },
      });
      return res.status(200).json({ shop: { ...body, storage: "database" } });
    }

    const shop = updateSellerShop(email, body);
    if (!shop) return res.status(403).json({ error: "Tu tienda aun no esta activa." });
    return res.status(200).json({ shop });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
