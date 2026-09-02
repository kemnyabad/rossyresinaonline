import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { isAdminApiRequest } from "@/lib/adminAuth";
import { decideSellerApplication, moderateProduct, readMarketplace, setSellerShopStatus } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminApiRequest(req)) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const data = await readMarketplace();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const body = req.body || {};

    if (body.type === "application") {
      const result = await decideSellerApplication(
        String(body.id || ""),
        body.decision === "APPROVED" ? "APPROVED" : "REJECTED",
        body.note
      );
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
      const product = await moderateProduct(String(body.id || ""), body.decision === "PUBLISHED" ? "PUBLISHED" : "REJECTED", body.note);
      if (!product) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ product });
    }

    if (body.type === "shop") {
      const id = String(body.id || "");
      const email = String(body.userEmail || "").trim().toLowerCase();
      const shop = await setSellerShopStatus(id, "PAUSED");
      if (!shop) return res.status(404).json({ error: "Tienda no encontrada" });
      try {
        await (prisma as any).user.update({
          where: { email: email || shop.userEmail },
          data: { role: "CUSTOMER" },
        });
      } catch {
        // La tienda queda pausada aunque el usuario no este en la base.
      }
      return res.status(200).json({ shop });
    }

    return res.status(400).json({ error: "Accion invalida" });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
