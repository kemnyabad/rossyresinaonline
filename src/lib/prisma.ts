import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

const withSafePoolParams = (rawUrl?: string): string | undefined => {
  const url = String(rawUrl || "").trim();
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.get("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }
    if (!parsed.searchParams.get("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "20");
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

const databaseUrl = withSafePoolParams(process.env.DATABASE_URL);

const createClient = () =>
  databaseUrl
    ? new PrismaClient({ datasources: { db: { url: databaseUrl } } })
    : new PrismaClient();

if (process.env.NODE_ENV === "development") {
  // En desarrollo siempre crear cliente fresco para evitar estado inválido tras hot reload
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
}

const prisma = globalForPrisma.prisma!;

export default prisma;
