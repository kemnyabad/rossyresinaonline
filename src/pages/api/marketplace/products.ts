import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProducts,
  setSellerProductStatus,
  updateSellerProduct,
} from "@/lib/marketplaceStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const products = await getSellerProducts(email);
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!String(body.name || "").trim() || !String(body.category || "").trim() || Number(body.price || 0) <= 0) {
      return res.status(400).json({ error: "Nombre, categoria y precio son obligatorios." });
    }
    const product = await createSellerProduct(email, body);
    if (!product) return res.status(403).json({ error: "Tu tienda aun no esta activa." });
    return res.status(201).json({ product });
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    const id = String(body.id || "");
    if (!id) return res.status(400).json({ error: "Producto no identificado." });

    if (body.action === "pause") {
      const product = await setSellerProductStatus(email, id, "PAUSED");
      return product ? res.status(200).json({ product }) : res.status(404).json({ error: "Producto no encontrado." });
    }
    if (body.action === "reactivate") {
      const product = await setSellerProductStatus(email, id, "PENDING");
      return product ? res.status(200).json({ product }) : res.status(404).json({ error: "Producto no encontrado." });
    }
    const product = await updateSellerProduct(email, id, body);
    return product ? res.status(200).json({ product }) : res.status(404).json({ error: "Producto no encontrado." });
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id || "");
    if (!id) return res.status(400).json({ error: "Producto no identificado." });
    const ok = await deleteSellerProduct(email, id);
    return ok ? res.status(204).end() : res.status(404).json({ error: "Producto no encontrado." });
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
