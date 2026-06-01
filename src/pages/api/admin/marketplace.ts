import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { isAdminApiRequest } from "@/lib/adminAuth";
import { decideSellerApplication, moderateProduct, readMarketplace, setSellerShopStatus } from "@/lib/marketplaceStore";
import { DB_APPLICATION_PREFIX, DB_PRODUCT_PREFIX, getDbMarketplaceData, mapDbApplication, moderateDbProduct } from "@/lib/marketplaceDb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminApiRequest(req)) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const data = readMarketplace();
    const dbData = await getDbMarketplaceData();
    const existingIds = new Set(data.applications.map((item) => item.id));
    const existingShopIds = new Set(data.shops.map((item) => item.id));
    const existingProductIds = new Set(data.products.map((item) => item.id));
    const applications = [
      ...dbData.applications.filter((item: any) => !existingIds.has(item.id)),
      ...data.applications,
    ];
    const shops = [
      ...dbData.shops.filter((item: any) => !existingShopIds.has(item.id)),
      ...data.shops,
    ];
    const products = [
      ...dbData.products.filter((item: any) => !existingProductIds.has(item.id)),
      ...data.products,
    ];
    return res.status(200).json({ ...data, applications, shops, products });
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    if (body.type === "application") {
      const id = String(body.id || "");
      if (id.startsWith(DB_APPLICATION_PREFIX)) {
        const dbId = id.slice(DB_APPLICATION_PREFIX.length);
        const approved = body.decision === "APPROVED";
        const updated = await (prisma as any).capacitacionInscripcion.update({
          where: { id: dbId },
          data: {
            estado: approved ? "APROBADO" : "RECHAZADO",
            notaAdmin: String(body.note || ""),
          },
        });
        if (approved) {
          try {
            await (prisma as any).user.update({
              where: { email: String(updated.email || "").toLowerCase() },
              data: { role: "SELLER" },
            });
          } catch {
            // Si el enum SELLER aun no esta migrado, la solicitud queda aprobada igualmente.
          }
        }
        return res.status(200).json({ application: mapDbApplication(updated) });
      }

      const result = decideSellerApplication(String(body.id || ""), body.decision === "APPROVED" ? "APPROVED" : "REJECTED", body.note);
      if (!result) return res.status(404).json({ error: "Solicitud no encontrada" });
      if (result.application.status === "APPROVED") {
        try {
          await (prisma as any).user.update({
            where: { email: result.application.userEmail },
            data: { role: "SELLER" },
          });
        } catch {
          // La tienda queda aprobada aunque la base aun no tenga el enum SELLER migrado.
        }
      }
      return res.status(200).json(result);
    }

    if (body.type === "product") {
      if (String(body.id || "").startsWith(DB_PRODUCT_PREFIX)) {
        const product = await moderateDbProduct(String(body.id || ""), body.decision === "PUBLISHED" ? "PUBLISHED" : "REJECTED", body.note);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        return res.status(200).json({ product });
      }

      const product = moderateProduct(String(body.id || ""), body.decision === "PUBLISHED" ? "PUBLISHED" : "REJECTED", body.note);
      if (!product) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ product });
    }

    if (body.type === "shop") {
      const id = String(body.id || "");
      const email = String(body.userEmail || "").trim().toLowerCase();

      if (id.startsWith("dbshop_")) {
        const application = await (prisma as any).capacitacionInscripcion.findFirst({
          where: {
            curso: "VENDE_CON_NOSOTROS",
            email,
            estado: { in: ["APROBADO", "APPROVED"] },
          },
          orderBy: { updatedAt: "desc" },
        });
        if (!application) return res.status(404).json({ error: "Tienda no encontrada" });

        const updated = await (prisma as any).capacitacionInscripcion.update({
          where: { id: application.id },
          data: {
            estado: "RECHAZADO",
            notaAdmin: String(body.note || "Tienda desactivada desde marketplace admin."),
          },
        });
        try {
          await (prisma as any).user.update({
            where: { email },
            data: { role: "CUSTOMER" },
          });
        } catch {
          // La tienda queda desactivada aunque el usuario ya no exista o no pueda actualizarse.
        }
        return res.status(200).json({ application: mapDbApplication(updated) });
      }

      const shop = setSellerShopStatus(id, "PAUSED");
      if (!shop) return res.status(404).json({ error: "Tienda no encontrada" });
      try {
        await (prisma as any).user.update({
          where: { email: shop.userEmail },
          data: { role: "CUSTOMER" },
        });
      } catch {
        // La tienda local queda pausada aunque el usuario no este en la base.
      }
      return res.status(200).json({ shop });
    }

    return res.status(400).json({ error: "Accion invalida" });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
