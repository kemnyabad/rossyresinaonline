import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";
const db = prisma as any;

const findProductByIdentifier = async (identifier: string) => {
  return db.product.findFirst({
    where: {
      OR: [{ id: identifier }, { legacyId: identifier }, { code: identifier }],
    },
  });
};

const serializeReview = (r: any) => ({
  id: r.id,
  productId: r.productId,
  userId: r.userId,
  userName: r.user?.name || "Usuario",
  userEmail: r.user?.email || "",
  rating: Number(r.rating || 0),
  comment: r.comment || "",
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const productIdentifier = String(req.query.productId || "").trim();
    if (!productIdentifier) return res.status(400).json({ error: "productId requerido" });
    try {
      const product = await findProductByIdentifier(productIdentifier);
      if (!product) return res.status(200).json([]);
      const reviews = await db.review.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      });
      return res.status(200).json(reviews.map(serializeReview));
    } catch {
      return res.status(500).json({ error: "No se pudieron obtener reseñas" });
    }
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session?.user?.email) return res.status(401).json({ error: "Debes iniciar sesion" });

    const body = req.body || {};
    const productIdentifier = String(body.productId || "").trim();
    const rating = Number(body.rating || 0);
    const comment = String(body.comment || "").trim();

    if (!productIdentifier) return res.status(400).json({ error: "productId requerido" });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Calificacion invalida" });
    }
    if (comment.length < 3) return res.status(400).json({ error: "Comentario muy corto" });
    if (comment.length > 500) return res.status(400).json({ error: "Comentario muy largo" });

    try {
      const email = String(session.user.email).toLowerCase().trim();
      const user = await db.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: "Usuario no autenticado" });

      const product = await findProductByIdentifier(productIdentifier);
      if (!product) return res.status(400).json({ error: "Producto no encontrado" });

      const saved = await db.review.upsert({
        where: {
          productId_userId: {
            productId: product.id,
            userId: user.id,
          },
        },
        update: { rating, comment },
        create: {
          productId: product.id,
          userId: user.id,
          rating,
          comment,
        },
        include: { user: { select: { name: true, email: true } } },
      });

      return res.status(201).json(serializeReview(saved));
    } catch {
      return res.status(500).json({ error: "No se pudo guardar la reseña" });
    }
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
