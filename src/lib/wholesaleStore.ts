import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createWholesaleSessionToken, readWholesaleUserIdFromToken } from "@/lib/wholesaleAuth";

export type WholesaleUserRecord = {
  id: string;
  name: string;
  business: string;
  phone: string;
  city: string;
  channel: string;
  volume: string;
  passwordHash: string;
  status: "PENDING" | "ACTIVE";
  createdAt: string;
  updatedAt: string;
};

const db = prisma as any;

const normalizePhone = (value: string) => String(value || "").replace(/\D/g, "");

const publicUser = (user: WholesaleUserRecord) => ({
  id: user.id,
  name: user.name,
  business: user.business,
  phone: user.phone,
  city: user.city,
  channel: user.channel,
  volume: user.volume,
  status: user.status,
});

export async function registerWholesaleUser(input: {
  name: string;
  business: string;
  phone: string;
  city: string;
  channel: string;
  volume: string;
  password: string;
}) {
  const phoneKey = normalizePhone(input.phone);
  if (!input.name.trim() || !phoneKey || !input.password.trim()) {
    throw new Error("Datos incompletos");
  }

  const existing = await db.wholesaleUser.findUnique({ where: { id: phoneKey } });
  const record = await db.wholesaleUser.upsert({
    where: { id: phoneKey },
    update: {
      name: input.name.trim(),
      business: input.business.trim(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      channel: input.channel.trim(),
      volume: input.volume.trim(),
      passwordHash: await bcrypt.hash(input.password, 10),
    },
    create: {
      id: phoneKey,
      name: input.name.trim(),
      business: input.business.trim(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      channel: input.channel.trim(),
      volume: input.volume.trim(),
      passwordHash: await bcrypt.hash(input.password, 10),
      status: existing?.status || "ACTIVE",
    },
  });

  const token = createWholesaleSessionToken(record.id);
  return { token, user: publicUser(record) };
}

export async function loginWholesaleUser(input: { user: string; password: string }) {
  const loginKey = normalizePhone(input.user);
  const found = await db.wholesaleUser.findFirst({
    where: { OR: [{ id: loginKey }, { phone: input.user.trim() }] },
  });
  if (!found || !(await bcrypt.compare(input.password, found.passwordHash))) {
    throw new Error("Usuario o clave mayorista incorrectos");
  }

  const token = createWholesaleSessionToken(found.id);
  return { token, user: publicUser(found) };
}

export async function getWholesaleSession(token: string) {
  const userId = readWholesaleUserIdFromToken(token);
  if (!userId) return null;
  const user = await db.wholesaleUser.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { token, user: publicUser(user) };
}

export async function logoutWholesaleSession(_token: string) {
  // Los tokens son firmados y sin estado en servidor; no hay nada que invalidar
  // del lado del servidor. El cliente descarta el token localmente.
}
