import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { getUsers, createUser, AppUser, UserRole } from "@/lib/users";
import { logger } from "@/lib/logger";
import {
  AdminUserCreateSchema,
  AdminUserDeleteSchema,
  AdminUserUpdateSchema,
} from "@/lib/validations";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.method === "GET") {
    const users = (await getUsers()).map(({ passwordHash, ...u }) => u);
    return res.status(200).json(users);
  }

  if (req.method === "POST") {
    const parsed = AdminUserCreateSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const { name, email, password, role } = parsed.data;
    try {
      const user = await createUser({
        name: String(name || "Usuario"),
        email: String(email || ""),
        password: String(password || ""),
        role: (role as UserRole) || "CUSTOMER",
      });
      const { passwordHash, ...safe } = user;
      return res.status(201).json(safe);
    } catch (e: any) {
      if (e?.message === "EMAIL_EXISTS") {
        return res.status(409).json({ error: "El correo ya esta registrado" });
      }
      logger.error("admin.users.create_failed", {
        error: String(e?.message || e),
        email,
      });
      return res.status(500).json({ error: "No se pudo crear" });
    }
  }

  if (req.method === "PUT") {
    const parsed = AdminUserUpdateSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const { id, role, name } = parsed.data;
    const user = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: {
        name: name ? String(name) : user.name,
        role: role ? (role as UserRole) : (user.role as any),
      },
    });
    const { passwordHash, ...safe } = updated as AppUser;
    return res.status(200).json(safe);
  }

  if (req.method === "DELETE") {
    const rawId = (req.query.id as string) || (req.body?.id as string);
    const parsed = AdminUserDeleteSchema.safeParse({ id: String(rawId || "") });
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const { id } = parsed.data;
    const user = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    await prisma.user.delete({ where: { id: String(id) } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "M?todo no permitido" });
}
