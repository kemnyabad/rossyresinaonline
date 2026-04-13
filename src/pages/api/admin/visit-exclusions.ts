import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { addExcludedIp, listExcludedIps, normalizeIp, removeExcludedIp } from "@/lib/visitAnalytics";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(req, res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "GET") {
    const items = await listExcludedIps();
    return res.status(200).json({
      myIp: getClientIp(req),
      items: items.map((row: any) => ({
        ip: row.ip,
        note: row.note || "",
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
      })),
    });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const ip = normalizeIp(body.ip || getClientIp(req));
    const note = String(body.note || "Excluida desde admin").trim();
    try {
      const row = await addExcludedIp({ ip, note });
      return res.status(201).json({
        ip: row.ip,
        note: row.note || "",
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
      });
    } catch (e: any) {
      if (e?.message === "IP_INVALIDA") return res.status(400).json({ error: "IP invalida" });
      return res.status(500).json({ error: "No se pudo excluir IP" });
    }
  }

  if (req.method === "DELETE") {
    const ip = normalizeIp(req.query.ip || req.body?.ip || "");
    if (!ip) return res.status(400).json({ error: "IP requerida" });
    await removeExcludedIp(ip);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "M?todo no permitido" });
}
