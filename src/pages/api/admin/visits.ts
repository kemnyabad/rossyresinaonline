import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getVisitStatsDb, parseWindowPreset, statsToCsv } from "@/lib/visitAnalytics";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "M?todo no permitido" });

  try {
    const session: any = await getServerSession(req, res, authOptions as any);
    const ok = session && (session.user as any)?.role === "ADMIN";
    if (!ok) return res.status(401).json({ error: "No autorizado" });

    const windowPreset = parseWindowPreset(req.query.window);
    const payload = await getVisitStatsDb(windowPreset);
    const format = String(req.query.format || "").trim().toLowerCase();

    if (format === "csv") {
      const csv = statsToCsv(payload);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="visitas-${windowPreset}.csv"`);
      return res.status(200).send(csv);
    }

    return res.status(200).json(payload);
  } catch {
    return res.status(500).json({ error: "No se pudieron obtener visitas" });
  }
}
