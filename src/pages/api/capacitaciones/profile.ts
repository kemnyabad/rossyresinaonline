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

  if (req.method === "GET") {
    const profile = await prisma.subscriberProfile.findUnique({
      where: { userId: user.id },
      include: { creations: true },
    });
    return res.status(200).json(profile);
  }

  if (req.method === "PUT") {
    const { displayName, bio, avatar, location, status } = req.body || {};
    const profile = await prisma.subscriberProfile.update({
      where: { userId: user.id },
      data: {
        displayName: String(displayName || "").trim() || undefined,
        bio: String(bio || "").trim() || undefined,
        avatar: String(avatar || "").trim() || undefined,
        location: String(location || "").trim() || undefined,
        status: status === "ACTIVO" || status === "DESACTIVADO" ? status : undefined,
      },
      include: { creations: true },
    });
    return res.status(200).json(profile);
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
