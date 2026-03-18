import prisma from "@/lib/prisma";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 32);
}

export async function ensureSubscriberProfile(input: { userId: string; name: string; email: string }) {
  const existing = await prisma.subscriberProfile.findUnique({ where: { userId: input.userId } });
  if (existing) return existing;

  const baseHandle = slugify(input.name || "usuario") || "usuario";
  const suffix = String(input.email || "").split("@")[0].slice(-4) || String(Date.now()).slice(-4);
  let handle = baseHandle;
  const handleExists = await prisma.subscriberProfile.findUnique({ where: { handle } });
  if (handleExists) {
    handle = `${baseHandle}-${suffix}`;
  }

  return prisma.subscriberProfile.create({
    data: {
      userId: input.userId,
      displayName: input.name || "Usuario",
      handle,
      avatar: "/logo.png",
      bio: "Nuevo suscriptor en Rossy Resina.",
      location: "Peru",
    },
  });
}
