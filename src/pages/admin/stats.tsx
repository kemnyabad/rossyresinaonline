import Head from "next/head";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/orders-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin - Estadísticas</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Estadísticas de pedidos</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-gray-900">Estadísticas históricas</p>
        {!stats ? (
          <p className="text-xs text-gray-500 mt-2">Cargando estadísticas...</p>
        ) : (
          <>
            <div className="mt-2 grid md:grid-cols-4 gap-3 text-sm">
              <div className="rounded border border-gray-200 p-3"><strong>Total pedidos:</strong> {Number(stats.totalOrders || 0)}</div>
              <div className="rounded border border-gray-200 p-3"><strong>Finalizados:</strong> {Number(stats.totalFinalizados || 0)}</div>
              <div className="rounded border border-gray-200 p-3"><strong>Pedidos {Number(stats.currentYear || 0)}:</strong> {Number(stats.currentYearOrders || 0)}</div>
              <div className="rounded border border-gray-200 p-3"><strong>Facturación acumulada:</strong> S/ {Number(stats.totalRevenue || 0).toFixed(2)}</div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[520px] w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">Año</th>
                    <th className="text-left p-2 border-b">Pedidos</th>
                    <th className="text-left p-2 border-b">Finalizados</th>
                    <th className="text-left p-2 border-b">Facturación</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(stats.byYear) ? stats.byYear : []).map((row: any) => (
                    <tr key={String(row.year)}>
                      <td className="p-2 border-b">{row.year}</td>
                      <td className="p-2 border-b">{Number(row.totalOrders || 0)}</td>
                      <td className="p-2 border-b">{Number(row.finalizados || 0)}</td>
                      <td className="p-2 border-b">S/ {Number(row.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Nota: en la vista activa de Pedidos se ocultan finalizados después de 2 horas, pero el historial completo queda guardado.
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/stats", permanent: false } };
  }
  return { props: {} };
};
