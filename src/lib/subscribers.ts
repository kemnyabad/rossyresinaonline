import fs from "fs";
import path from "path";

export type SubscriberStatus = "activo" | "desactivado";

export type SubscriberProfile = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: SubscriberStatus;
  bio: string;
  location: string;
  joined: string;
  creationsCount: number;
  followers: string;
  following: string;
  gallery: { id: string; type: "foto" | "video"; cover: string; title: string }[];
};

const dataPath = path.join(process.cwd(), "src", "data", "suscriptores.json");

function readAll(): SubscriberProfile[] {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(items: SubscriberProfile[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), "utf-8");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 32);
}

export function getSubscribers() {
  return readAll();
}

export function ensureSubscriberForUser(input: { name: string; email: string }) {
  const list = readAll();
  const email = String(input.email || "").trim().toLowerCase();
  const name = String(input.name || "Usuario").trim();
  const handle = slugify(name || "usuario");
  const existing = list.find(
    (s) => s.handle === handle || s.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing;

  const suffix = email ? email.split("@")[0].slice(-4) : String(Date.now()).slice(-4);
  const idBase = slugify(name || "usuario");
  const id = idBase ? `${idBase}-${suffix}` : `usuario-${suffix}`;
  const profile: SubscriberProfile = {
    id,
    name,
    handle: handle || `usuario${suffix}`,
    avatar: "/logo.png",
    status: "activo",
    bio: "Nuevo suscriptor en Rossy Resina.",
    location: "Peru",
    joined: new Date().toLocaleDateString("es-PE", { month: "short", year: "numeric" }),
    creationsCount: 0,
    followers: "0",
    following: "0",
    gallery: [],
  };
  list.unshift(profile);
  writeAll(list);
  return profile;
}
