// Use require to avoid type resolution issues during production builds.
const bcrypt = require("bcryptjs");
import { promises as fs } from "fs";
import path from "path";
import prisma from "./prisma";

export type UserRole = "ADMIN" | "EDITOR" | "SELLER" | "CUSTOMER";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string | Date;
}

const USERS_BACKUP_PATH = path.join(process.cwd(), "src", "data", "users.json");

const normalizeRole = (role: unknown): UserRole => {
  if (role === "ADMIN" || role === "EDITOR" || role === "SELLER" || role === "CUSTOMER") return role;
  return "CUSTOMER";
};

async function getBackupUsers(): Promise<AppUser[]> {
  try {
    const raw = await fs.readFile(USERS_BACKUP_PATH, "utf8");
    const users = JSON.parse(raw);
    if (!Array.isArray(users)) return [];
    return users.map((user) => ({
      id: String(user.id || user.email || ""),
      name: String(user.name || "Usuario"),
      email: String(user.email || "").trim().toLowerCase(),
      passwordHash: String(user.passwordHash || ""),
      role: normalizeRole(user.role),
      createdAt: String(user.createdAt || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getUsers(): Promise<AppUser[]> {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return users.map((user) => ({ ...user, role: normalizeRole(user.role) } as AppUser));
  } catch {
    return getBackupUsers();
  }
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const needle = email.trim().toLowerCase();
  try {
    const user = await prisma.user.findUnique({ where: { email: needle } });
    return user ? ({ ...user, role: normalizeRole(user.role) } as AppUser) : null;
  } catch {
    const users = await getBackupUsers();
    return users.find((user) => user.email === needle) || null;
  }
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim() || "Usuario",
      email,
      passwordHash,
      role: input.role || "CUSTOMER",
    },
  });
  return user as AppUser;
}

export async function ensureOAuthUser(input: {
  name?: string | null;
  email: string;
  role?: UserRole;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(`oauth:${email}:${Date.now()}:${Math.random()}`, 10);
  const user = await prisma.user.create({
    data: {
      name: String(input.name || "Usuario").trim() || "Usuario",
      email,
      passwordHash,
      role: input.role || "CUSTOMER",
    },
  });
  return user as AppUser;
}

export async function verifyUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? (user as AppUser) : null;
}

export function isAdminEmail(email?: string | null) {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!email) return false;
  return allowed.includes(email.toLowerCase());
}

export async function ensureAdminFromEnv() {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const adminPass = String(process.env.ADMIN_PASSWORD || "");
  if (allowed.length === 0 || !adminPass) return;
  const email = allowed[0];
  const existing = await findUserByEmail(email);
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    }
    return;
  }
  const passwordHash = await bcrypt.hash(adminPass, 10);
  await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });
}

