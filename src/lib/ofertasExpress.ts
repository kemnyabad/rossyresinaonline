import prisma from "@/lib/prisma";

const db = prisma as any;

export type OfertaExpressItem = {
  id: string;
  nombre: string;
  imagen: string;
  precio: number | null;
};

export async function getActiveOfertasExpress(): Promise<OfertaExpressItem[]> {
  const now = new Date();
  const rows = await db.ofertaExpress.findMany({
    where: {
      activo: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((row: any) => ({
    id: row.id,
    nombre: row.nombre,
    imagen: row.imagen,
    precio: row.precio !== null && row.precio !== undefined ? Number(row.precio) : null,
  }));
}
