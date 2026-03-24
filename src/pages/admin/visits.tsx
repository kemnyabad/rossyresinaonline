import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type WindowPreset = "24h" | "7d" | "30d" | "90d" | "365d" | "all";

const WINDOW_OPTIONS: Array<{ value: WindowPreset; label: string }> = [
  { value: "24h", label: "24 horas" },
  { value: "7d", label: "7 d?as" },
  { value: "30d", label: "30 d?as" },
  { value: "90d", label: "90 d?as" },
  { value: "365d", label: "365 d?as" },
  { value: "all", label: "Todo el historial" },
];

const fmtDateTime = (value: string | null | undefined) => {
  const v = String(value || "").trim();
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-PE");
};

export default function AdminVisitsPage() {
  const [windowPreset, setWindowPreset] = useState<WindowPreset>("30d");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myIp, setMyIp] = useState("");
  const [excludedIps, setExcludedIps] = useState<Array<{ ip: string; note: string; createdAt: string }>>([]);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipMessage, setIpMessage] = useState("");

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const r = await fetch(`/api/admin/visits?window=${encodeURIComponent(windowPreset)}`, { signal: controller.signal });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(String(body?.error || `Error ${r.status}`));
      }
      const body = await r.json();
      setStats(body);
      if (silent) setError("");
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!silent) {
        if (msg.toLowerCase().includes("abort")) {
          setError("Tiempo de espera agotado. Reintenta en unos segundos.");
        } else {
          setError(msg || "No se pudieron cargar estad?sticas");
        }
        setStats(null);
      }
    } finally {
      clearTimeout(timeout);
      controller.abort();
      if (!silent) {
        setLoading(false);
      }
    }
  }, [windowPreset]);

  const loadExcludedIps = useCallback(async () => {
    setIpLoading(true);
    setIpMessage("");
    try {
      const r = await fetch("/api/admin/visit-exclusions");
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(String(body?.error || `Error ${r.status}`));
      setMyIp(String(body?.myIp || ""));
      setExcludedIps(Array.isArray(body?.items) ? body.items : []);
    } catch (e: any) {
      setIpMessage(`No se pudo cargar exclusion de IPs: ${String(e?.message || "Error")}`);
    } finally {
      setIpLoading(false);
    }
  }, []);

  const excludeMyIp = useCallback(async () => {
    if (!myIp) {
      setIpMessage("No se detect? tu IP en esta sesi?n.");
      return;
    }
    setIpLoading(true);
    setIpMessage("");
    try {
      const r = await fetch("/api/admin/visit-exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: myIp, note: "IP administradora excluida" }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(String(body?.error || `Error ${r.status}`));
      await loadExcludedIps();
      setIpMessage(`Tu IP ${myIp} fue excluida.`);
    } catch (e: any) {
      setIpMessage(`No se pudo excluir tu IP: ${String(e?.message || "Error")}`);
    } finally {
      setIpLoading(false);
    }
  }, [loadExcludedIps, myIp]);

  const removeExcludedIp = useCallback(
    async (ip: string) => {
      const target = String(ip || "").trim();
      if (!target) return;
      setIpLoading(true);
      setIpMessage("");
      try {
        const r = await fetch(`/api/admin/visit-exclusions?ip=${encodeURIComponent(target)}`, { method: "DELETE" });
        if (!r.ok && r.status !== 204) {
          const body = await r.json().catch(() => ({}));
          throw new Error(String(body?.error || `Error ${r.status}`));
        }
        await loadExcludedIps();
      } catch (e: any) {
        setIpMessage(`No se pudo quitar IP excluida: ${String(e?.message || "Error")}`);
      } finally {
        setIpLoading(false);
      }
    },
    [loadExcludedIps]
  );

  useEffect(() => {
    load({ silent: false });
    loadExcludedIps();
  }, [load, loadExcludedIps]);

  useEffect(() => {
    setIpMessage("");
  }, [windowPreset]);

  const maxSeriesValue = useMemo(() => {
    if (!Array.isArray(stats?.series) || stats.series.length === 0) return 1;
    return Math.max(1, ...stats.series.map((r: any) => Number(r.visits || 0)));
  }, [stats]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin - Visitas</title>
      </Head>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Visitas de la web</h1>
        <div className="flex items-center gap-2">
          <select
            value={windowPreset}
            onChange={(e) => setWindowPreset(e.target.value as WindowPreset)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {WINDOW_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => load({ silent: false })}
            className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
          >
            Actualizar
          </button>
          <a
            href={`/api/admin/visits?window=${encodeURIComponent(windowPreset)}&format=csv`}
            className="rounded-md bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">Cargando estad?sticas...</div>
      ) : error ? (
        <div className="bg-white border border-red-200 rounded-lg p-6 text-sm text-red-700">
          <p>No se pudieron cargar las estad?sticas: {error}</p>
          <button
            type="button"
            onClick={() => load({ silent: false })}
            className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      ) : !stats ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">A?n no hay datos de visitas.</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Excluir mi IP de visitas</p>
            <p className="text-xs text-gray-600 mb-3">
              Tu IP detectada: <span className="font-semibold">{myIp || "No detectada"}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                disabled={!myIp || ipLoading}
                onClick={excludeMyIp}
                className="rounded-md bg-indigo-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 hover:bg-indigo-800"
              >
                Excluir mi IP
              </button>
              <button
                type="button"
                disabled={ipLoading}
                onClick={loadExcludedIps}
                className="rounded-md bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Recargar lista
              </button>
            </div>
            {ipMessage ? <p className="text-xs text-gray-700 mb-3">{ipMessage}</p> : null}
            <div className="overflow-x-auto">
              <table className="min-w-[620px] w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">IP excluida</th>
                    <th className="text-left p-2 border-b">Nota</th>
                    <th className="text-left p-2 border-b">Fecha</th>
                    <th className="text-left p-2 border-b">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {excludedIps.map((row) => (
                    <tr key={row.ip}>
                      <td className="p-2 border-b">{row.ip}</td>
                      <td className="p-2 border-b">{row.note || "-"}</td>
                      <td className="p-2 border-b">{fmtDateTime(row.createdAt)}</td>
                      <td className="p-2 border-b">
                        <button
                          type="button"
                          disabled={ipLoading}
                          onClick={() => removeExcludedIp(row.ip)}
                          className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {excludedIps.length === 0 ? (
                    <tr>
                      <td className="p-2 border-b text-gray-500" colSpan={4}>No hay IPs excluidas.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Ventana: {stats?.window?.label || "-"} | Ultima actualizacion: {fmtDateTime(stats?.generatedAt)}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-500">Total visitas</p>
              <p className="text-2xl font-semibold mt-1">{Number(stats?.overview?.totalVisits || 0)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-500">Visitantes unicos</p>
              <p className="text-2xl font-semibold mt-1">{Number(stats?.overview?.uniqueVisitors || 0)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-500">Visitas de usuarios con cuenta</p>
              <p className="text-2xl font-semibold mt-1">{Number(stats?.overview?.registeredUserVisits || 0)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-500">Promedio por visitante</p>
              <p className="text-2xl font-semibold mt-1">{Number(stats?.overview?.avgVisitsPerVisitor || 0)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">Tendencia de visitas ({stats?.window?.granularity === "month" ? "mensual" : "diaria"})</p>
            {Array.isArray(stats?.series) && stats.series.length > 0 ? (
              <div className="space-y-2">
                {stats.series.map((row: any) => {
                  const visits = Number(row.visits || 0);
                  const width = Math.max(2, Math.round((visits / maxSeriesValue) * 100));
                  return (
                    <div key={String(row.period)} className="flex items-center gap-3 text-xs">
                      <div className="w-24 shrink-0 text-gray-600">{String(row.period)}</div>
                      <div className="h-3 rounded bg-orange-500" style={{ width: `${width}%` }} />
                      <div className="w-14 shrink-0 text-right">{visits}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No hay datos para esta ventana.</p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Visitas por pais</p>
              <div className="overflow-x-auto">
                <table className="min-w-[520px] w-full text-xs border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b">Pais</th>
                      <th className="text-left p-2 border-b">Visitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(stats.byCountry) ? stats.byCountry : []).map((row: any) => (
                      <tr key={String(row.country)}>
                        <td className="p-2 border-b">{row.country}</td>
                        <td className="p-2 border-b">{Number(row.visits || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Visitas por ciudad</p>
              <div className="overflow-x-auto">
                <table className="min-w-[520px] w-full text-xs border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b">Ciudad</th>
                      <th className="text-left p-2 border-b">Visitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(stats.byCity) ? stats.byCity : []).map((row: any) => (
                      <tr key={String(row.city)}>
                        <td className="p-2 border-b">{row.city}</td>
                        <td className="p-2 border-b">{Number(row.visits || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Paginas m?s visitadas</p>
              <div className="overflow-x-auto">
                <table className="min-w-[520px] w-full text-xs border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b">Ruta</th>
                      <th className="text-left p-2 border-b">Visitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(stats.topPages) ? stats.topPages : []).map((row: any) => (
                      <tr key={String(row.path)}>
                        <td className="p-2 border-b">{row.path}</td>
                        <td className="p-2 border-b">{Number(row.visits || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Usuarios que m?s visitan</p>
              <div className="overflow-x-auto">
                <table className="min-w-[620px] w-full text-xs border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b">Usuario</th>
                      <th className="text-left p-2 border-b">Email</th>
                      <th className="text-left p-2 border-b">Visitas</th>
                      <th className="text-left p-2 border-b">Ultima visita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(stats.topUsers) ? stats.topUsers : []).map((row: any) => (
                      <tr key={String(row.email)}>
                        <td className="p-2 border-b">{row.name || "-"}</td>
                        <td className="p-2 border-b">{row.email || "-"}</td>
                        <td className="p-2 border-b">{Number(row.count || 0)}</td>
                        <td className="p-2 border-b">{fmtDateTime(row.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">Visitantes (incluye no logueados)</p>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">Visitante</th>
                    <th className="text-left p-2 border-b">Usuario</th>
                    <th className="text-left p-2 border-b">Pais</th>
                    <th className="text-left p-2 border-b">Ciudad</th>
                    <th className="text-left p-2 border-b">Visitas</th>
                    <th className="text-left p-2 border-b">Ultima visita</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(stats.topVisitors) ? stats.topVisitors : []).map((row: any) => (
                    <tr key={String(row.id)}>
                      <td className="p-2 border-b">{row.id}</td>
                      <td className="p-2 border-b">{row.userEmail || "-"}</td>
                      <td className="p-2 border-b">{row.country || "-"}</td>
                      <td className="p-2 border-b">{row.city || "-"}</td>
                      <td className="p-2 border-b">{Number(row.count || 0)}</td>
                      <td className="p-2 border-b">{fmtDateTime(row.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/visits", permanent: false } };
  }
  return { props: {} };
};
