import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { isAdminApiRequest } from "@/lib/adminAuth";
import { decideSellerApplication, moderateProduct, readMarketplace } from "@/lib/marketplaceStore";

const DB_APPLICATION_PREFIX = "db_";

function safeParseMessage(value: string) {
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
}

function mapDbApplication(row: any) {
  const meta = safeParseMessage(row.mensaje);
  const estado = String(row.estado || "PENDIENTE").toUpperCase();
  const status = estado === "APROBADO" || estado === "APPROVED"
    ? "APPROVED"
    : estado === "RECHAZADO" || estado === "REJECTED"
      ? "REJECTED"
      : "PENDING";

  return {
    id: `${DB_APPLICATION_PREFIX}${row.id}`,
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
  if (!isAdminApiRequest(req)) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const data = readMarketplace();
    const dbRows = await (prisma as any).capacitacionInscripcion.findMany({
      where: { curso: "VENDE_CON_NOSOTROS" },
      orderBy: { createdAt: "desc" },
    });
    const dbApplications = dbRows.map(mapDbApplication);
    const existingIds = new Set(data.applications.map((item) => item.id));
    const applications = [
      ...dbApplications.filter((item: any) => !existingIds.has(item.id)),
      ...data.applications,
    ];
    return res.status(200).json({ ...data, applications });
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
      const product = moderateProduct(String(body.id || ""), body.decision === "PUBLISHED" ? "PUBLISHED" : "REJECTED", body.note);
      if (!product) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ product });
    }

    return res.status(400).json({ error: "Accion invalida" });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
