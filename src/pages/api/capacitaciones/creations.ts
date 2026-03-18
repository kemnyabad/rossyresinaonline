import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.email) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const profile = await prisma.subscriberProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return res.status(404).json({ error: "Perfil no encontrado" });

  const { title, cover, type } = req.body || {};
  if (!title || !cover || !type) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  if (type !== "FOTO" && type !== "VIDEO") {
    return res.status(400).json({ error: "Tipo invalido" });
  }

  const created = await prisma.creation.create({
    data: {
      profileId: profile.id,
      title: String(title).trim(),
      cover: String(cover).trim(),
      type,
    },
  });
  return res.status(201).json(created);
}
