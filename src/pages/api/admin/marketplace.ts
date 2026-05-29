import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { isAdminApiRequest } from "@/lib/adminAuth";
import { decideSellerApplication, moderateProduct, readMarketplace } from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminApiRequest(req)) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    return res.status(200).json(readMarketplace());
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    if (body.type === "application") {
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
      const product = moderateProduct(String(body.id || ""), body.decision === "PUBLISHED" ? "PUBLISHED" : "REJECTED", body.note);
      if (!product) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ product });
    }

    return res.status(400).json({ error: "Accion invalida" });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
