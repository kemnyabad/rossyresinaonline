import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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

type WholesaleSessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
};

type WholesaleData = {
  users: WholesaleUserRecord[];
  sessions: WholesaleSessionRecord[];
};

const dataFile = path.join(process.cwd(), "src", "data", "wholesale-users.json");

const emptyData = (): WholesaleData => ({ users: [], sessions: [] });

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

async function readData(): Promise<WholesaleData> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw || "{}");
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch (error: any) {
    if (error?.code === "ENOENT") return emptyData();
    throw error;
  }
}

async function writeData(data: WholesaleData) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

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

  const data = await readData();
  const now = new Date().toISOString();
  const existing = data.users.find((user) => user.id === phoneKey);
  const record: WholesaleUserRecord = {
    id: phoneKey,
    name: input.name.trim(),
    business: input.business.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    channel: input.channel.trim(),
    volume: input.volume.trim(),
    passwordHash: await bcrypt.hash(input.password, 10),
    status: existing?.status || "ACTIVE",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  data.users = [...data.users.filter((user) => user.id !== phoneKey), record];
  const token = crypto.randomBytes(32).toString("hex");
  data.sessions = [...data.sessions.filter((session) => session.userId !== phoneKey), { token, userId: phoneKey, createdAt: now }];
  await writeData(data);

  return { token, user: publicUser(record) };
}

export async function loginWholesaleUser(input: { user: string; password: string }) {
  const data = await readData();
  const loginKey = normalizePhone(input.user);
  const found = data.users.find(
    (user) => user.id === loginKey || normalizePhone(user.phone) === loginKey
  );
  if (!found || !(await bcrypt.compare(input.password, found.passwordHash))) {
    throw new Error("Usuario o clave mayorista incorrectos");
  }

  const token = crypto.randomBytes(32).toString("hex");
  data.sessions = [...data.sessions.filter((session) => session.userId !== found.id), { token, userId: found.id, createdAt: new Date().toISOString() }];
  await writeData(data);

  return { token, user: publicUser(found) };
}

export async function getWholesaleSession(token: string) {
  if (!token) return null;
  const data = await readData();
  const session = data.sessions.find((item) => item.token === token);
  if (!session) return null;
  const user = data.users.find((item) => item.id === session.userId);
  if (!user) return null;
  return { token, user: publicUser(user) };
}

export async function logoutWholesaleSession(token: string) {
  if (!token) return;
  const data = await readData();
  data.sessions = data.sessions.filter((item) => item.token !== token);
  await writeData(data);
}
