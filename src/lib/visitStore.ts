import fs from "fs";
import os from "os";
import path from "path";

type VisitorAgg = {
  id: string;
  count: number;
  userEmail: string;
  userName: string;
  country: string;
  city: string;
  lastSeenAt: string;
};

type UserAgg = {
  email: string;
  name: string;
  count: number;
  lastSeenAt: string;
};

type VisitStore = {
  totalVisits: number;
  countries: Record<string, number>;
  cities: Record<string, number>;
  paths: Record<string, number>;
  visitors: Record<string, VisitorAgg>;
  users: Record<string, UserAgg>;
  recent: Array<{ at: string; path: string; country: string; city: string; userEmail: string; visitorId: string }>;
};

const runtimePath = path.join(process.cwd(), "data", "visits.json");
const fallbackPath = path.join(os.tmpdir(), "rossy-resina", "visits.json");
const MEMORY_KEY = "__rr_visit_store_memory__";

function cloneStore(data: VisitStore): VisitStore {
  return {
    totalVisits: Number(data.totalVisits || 0),
    countries: { ...(data.countries || {}) },
    cities: { ...(data.cities || {}) },
    paths: { ...(data.paths || {}) },
    visitors: { ...(data.visitors || {}) },
    users: { ...(data.users || {}) },
    recent: Array.isArray(data.recent) ? [...data.recent] : [],
  };
}

const emptyStore = (): VisitStore => ({
  totalVisits: 0,
  countries: {},
  cities: {},
  paths: {},
  visitors: {},
  users: {},
  recent: [],
});

function readMemoryStore(): VisitStore {
  const g = globalThis as any;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = emptyStore();
  return cloneStore(g[MEMORY_KEY] as VisitStore);
}

function writeMemoryStore(data: VisitStore) {
  const g = globalThis as any;
  g[MEMORY_KEY] = cloneStore(data);
}

let selectedStorePath: string | null | undefined;

function ensureWritableFile(targetPath: string) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(targetPath)) fs.writeFileSync(targetPath, JSON.stringify(emptyStore(), null, 2), "utf-8");
}

function resolveStorePath(): string | null {
  if (selectedStorePath !== undefined) return selectedStorePath;

  const envPath = String(process.env.VISITS_STORE_PATH || "").trim();
  const candidates = [envPath, runtimePath, fallbackPath].filter(Boolean);

  for (const candidate of candidates) {
    try {
      ensureWritableFile(candidate);
      selectedStorePath = candidate;
      return selectedStorePath;
    } catch {
      // Intentar siguiente ruta.
    }
  }

  selectedStorePath = null;
  return null;
}

function ensureFile() {
  resolveStorePath();
}

export function readVisitStore(): VisitStore {
  const storePath = resolveStorePath();
  if (!storePath) return readMemoryStore();

  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    const parsed = JSON.parse(raw);
    const normalized = {
      ...emptyStore(),
      ...(parsed || {}),
      countries: { ...(parsed?.countries || {}) },
      cities: { ...(parsed?.cities || {}) },
      paths: { ...(parsed?.paths || {}) },
      visitors: { ...(parsed?.visitors || {}) },
      users: { ...(parsed?.users || {}) },
      recent: Array.isArray(parsed?.recent) ? parsed.recent : [],
    };
    writeMemoryStore(normalized);
    return normalized;
  } catch {
    return readMemoryStore();
  }
}

export function writeVisitStore(data: VisitStore) {
  const payload = cloneStore(data);
  writeMemoryStore(payload);

  const storePath = resolveStorePath();
  if (!storePath) return;

  try {
    fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), "utf-8");
  } catch {
    // Si falla disco, queda al menos en memoria para tiempo real.
  }
}

export function recordVisit(input: {
  path: string;
  country: string;
  city: string;
  visitorId: string;
  userEmail?: string;
  userName?: string;
  at?: string;
}) {
  const store = readVisitStore();
  const at = String(input.at || new Date().toISOString());
  const route = String(input.path || "/").trim() || "/";
  const country = String(input.country || "DESCONOCIDO").trim().toUpperCase();
  const city = String(input.city || "DESCONOCIDA").trim().toUpperCase();
  const visitorId = String(input.visitorId || "anon").trim() || "anon";
  const userEmail = String(input.userEmail || "").trim().toLowerCase();
  const userName = String(input.userName || "").trim();

  store.totalVisits += 1;
  store.countries[country] = Number(store.countries[country] || 0) + 1;
  store.cities[city] = Number(store.cities[city] || 0) + 1;
  store.paths[route] = Number(store.paths[route] || 0) + 1;

  const prevVisitor = store.visitors[visitorId] || {
    id: visitorId,
    count: 0,
    userEmail: "",
    userName: "",
    country,
    city,
    lastSeenAt: at,
  };
  store.visitors[visitorId] = {
    ...prevVisitor,
    count: Number(prevVisitor.count || 0) + 1,
    userEmail: userEmail || prevVisitor.userEmail || "",
    userName: userName || prevVisitor.userName || "",
    country,
    city,
    lastSeenAt: at,
  };

  if (userEmail) {
    const prevUser = store.users[userEmail] || {
      email: userEmail,
      name: userName || userEmail,
      count: 0,
      lastSeenAt: at,
    };
    store.users[userEmail] = {
      ...prevUser,
      name: userName || prevUser.name || userEmail,
      count: Number(prevUser.count || 0) + 1,
      lastSeenAt: at,
    };
  }

  store.recent.unshift({ at, path: route, country, city, userEmail, visitorId });
  if (store.recent.length > 200) store.recent = store.recent.slice(0, 200);

  writeVisitStore(store);
}

export function getVisitStats() {
  const store = readVisitStore();
  const byCountry = Object.entries(store.countries)
    .map(([country, visits]) => ({ country, visits: Number(visits || 0) }))
    .sort((a, b) => b.visits - a.visits);
  const byCity = Object.entries(store.cities)
    .map(([city, visits]) => ({ city, visits: Number(visits || 0) }))
    .sort((a, b) => b.visits - a.visits);

  const topUsers = Object.values(store.users)
    .map((u) => ({ ...u, count: Number(u.count || 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topVisitors = Object.values(store.visitors)
    .map((v) => ({ ...v, count: Number(v.count || 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalVisits: Number(store.totalVisits || 0),
    byCountry,
    byCity,
    topUsers,
    topVisitors,
    topPages: Object.entries(store.paths)
      .map(([path, visits]) => ({ path, visits: Number(visits || 0) }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10),
    recent: store.recent,
  };
}
