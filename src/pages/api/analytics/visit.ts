import type { NextApiRequest, NextApiResponse } from "next";
import { isIpExcluded, normalizeIp, recordVisitDb } from "@/lib/visitAnalytics";

const getCountry = (req: NextApiRequest): string => {
  const candidates = [
    req.headers["x-vercel-ip-country"],
    req.headers["cf-ipcountry"],
    req.headers["x-country-code"],
  ];
  for (const value of candidates) {
    const v = Array.isArray(value) ? value[0] : value;
    const c = String(v || "").trim();
    if (c) return c.toUpperCase();
  }
  return "DESCONOCIDO";
};

const getCity = (req: NextApiRequest): string => {
  const candidates = [
    req.headers["x-vercel-ip-city"],
    req.headers["cf-ipcity"],
    req.headers["x-city-name"],
  ];
  for (const value of candidates) {
    const v = Array.isArray(value) ? value[0] : value;
    const c = String(v || "").trim();
    if (c) {
      try {
        return decodeURIComponent(c).toUpperCase();
      } catch {
        return c.toUpperCase();
      }
    }
  }
  return "DESCONOCIDA";
};

const getClientIp = (req: NextApiRequest): string => {
  const fromForwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)[0];
  const fromRealIp = String(req.headers["x-real-ip"] || "").trim();
  const fromVercel = String(req.headers["x-vercel-forwarded-for"] || "").trim();
  const fromCf = String(req.headers["cf-connecting-ip"] || "").trim();
  const fromSocket = String(req.socket.remoteAddress || "").trim();
  return normalizeIp(fromForwarded || fromRealIp || fromVercel || fromCf || fromSocket);
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "M?todo no permitido" });

  return (async () => {
    const body = req.body || {};
    const path = String(body.path || "/").trim() || "/";
    const visitorId = String(body.visitorId || "anon").trim() || "anon";
    const userEmail = String(body.userEmail || "").trim().toLowerCase();
    const userName = String(body.userName || "").trim();
    const clientIp = getClientIp(req);

    const host = String(req.headers.host || "").toLowerCase();
    const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1");
    const isTestPath = path.startsWith("/__") || path.includes("health") || path.includes("test");
    const visitorIdLower = visitorId.toLowerCase();
    const isTestVisitor =
      visitorIdLower.startsWith("test-") ||
      visitorIdLower.includes("health") ||
      visitorIdLower.includes("demo");

    const country = getCountry(req);
    const excludedByIp = clientIp ? await isIpExcluded(clientIp) : false;

    if (
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      isLocalHost ||
      isTestPath ||
      isTestVisitor ||
      excludedByIp ||
      country !== "PE"
    ) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    await recordVisitDb({
      path,
      visitorId,
      userEmail,
      userName,
      country,
      city: getCity(req),
    });

    return res.status(200).json({ ok: true });
  })().catch(() => res.status(200).json({ ok: false }));
}
