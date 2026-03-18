import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { ensureSubscriberProfile } from "@/lib/capacitaciones";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.email || !session?.user?.name) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const profile = await ensureSubscriberProfile({ userId: user.id, name: user.name, email: user.email });
  return res.status(200).json({ id: profile.id, handle: profile.handle });
}
