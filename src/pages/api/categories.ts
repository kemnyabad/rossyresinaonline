import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

const defaultCategories = [
  { name: "Moldes de silicona", slug: "moldes-de-silicona" },
  { name: "Pigmentos y glitters", slug: "pigmentos-y-glitters" },
  { name: "Accesorios", slug: "accesorios" },
  { name: "Kits resineros", slug: "kits-resineros" },
];

const toSlug = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    if (categories.length === 0) {
      // Si no existen, crear valores por defecto
      await Promise.all(
        defaultCategories.map((cat) =>
          prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
          })
        )
      );
      const filled = await prisma.category.findMany({ orderBy: { name: "asc" } });
      return res.status(200).json(filled);
    }
    return res.status(200).json(categories);
  }

  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || (session.user as any)?.role !== "ADMIN") return res.status(401).json({ error: "No autorizado" });

  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const name = String(body.name || "").trim();
      const slug = String(body.slug || "").trim() || toSlug(name);
      if (!name) return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
      if (!slug) return res.status(400).json({ error: "El slug de la categoría es obligatorio" });

      const created = await prisma.category.create({
        data: {
          name,
          slug,
        },
      });
      return res.status(201).json(created);
    } catch (error: any) {
      console.error("POST /api/categories error", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una categoría con ese nombre o slug" });
      }
      return res.status(500).json({ error: "No se pudo guardar la categoría" });
    }
  }

  if (req.method === "PUT") {
    try {
      const body = req.body || {};
      const id = String(body.id || body._id || "").trim();
      if (!id) return res.status(400).json({ error: "ID requerido" });
      const name = String(body.name || "").trim();
      const slug = String(body.slug || "").trim() || toSlug(name);
      if (!name) return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
      if (!slug) return res.status(400).json({ error: "El slug de la categoría es obligatorio" });

      const updated = await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
        },
      });
      return res.status(200).json(updated);
    } catch (error: any) {
      console.error("PUT /api/categories error", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una categoría con ese nombre o slug" });
      }
      return res.status(500).json({ error: "No se pudo actualizar la categoría" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const id = (req.query._id as string) || (req.body?._id as string);
      if (!id) return res.status(400).json({ error: "ID requerido" });
      await prisma.category.delete({ where: { id } });
      return res.status(204).end();
    } catch (error: any) {
      console.error("DELETE /api/categories error", error);
      return res.status(500).json({ error: "No se pudo eliminar la categoría" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
