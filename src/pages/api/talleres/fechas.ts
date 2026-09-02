import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { datetimeLocalToPeruDate } from "@/lib/peruTime";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") {
    const { id, fecha } = req.body;
    if (!id || !fecha) return res.status(400).json({ error: "id y fecha son requeridos" });
    try {
      const updated = await prisma.cursoFecha.update({
        where: { id: String(id) },
        data: { fecha: datetimeLocalToPeruDate(fecha) },
        include: { inscripciones: { select: { id: true, nombre: true, email: true, telefono: true, notas: true, createdAt: true } } },
      });
      return res.status(200).json(updated);
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "No se pudo actualizar la fecha" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id requerido" });
    try {
      await prisma.cursoFecha.delete({ where: { id: String(id) } });
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "No se pudo eliminar la fecha" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
