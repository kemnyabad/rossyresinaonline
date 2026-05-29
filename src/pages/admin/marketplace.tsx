import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { requireAdminPage } from "@/lib/adminAuth";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AdminMarketplacePage() {
  const [data, setData] = useState<any>({ applications: [], shops: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/marketplace", { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setData(body);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (payload: any) => {
    const res = await fetch("/api/admin/marketplace", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNotice(res.ok ? "Accion aplicada correctamente." : "No se pudo aplicar la accion.");
    await load();
  };

  const pendingApplications = useMemo(() => data.applications.filter((item: any) => item.status === "PENDING"), [data.applications]);
  const pendingProducts = useMemo(() => data.products.filter((item: any) => item.status === "PENDING"), [data.products]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-amazon_blue">Marketplace</p>
          <h2 className="mt-1 text-2xl font-black text-gray-950">Moderacion de vendedoras</h2>
          <p className="mt-1 text-sm text-gray-500">Solicitudes, tiendas y productos del Mercado Creativo.</p>
        </div>
        <button onClick={load} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {notice && <div className="rounded-xl border border-pink-100 bg-white p-4 text-sm font-semibold text-gray-700">{notice}</div>}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Solicitudes pendientes" value={pendingApplications.length} />
        <Stat label="Tiendas activas" value={data.shops.filter((item: any) => item.status === "ACTIVE").length} />
        <Stat label="Productos pendientes" value={pendingProducts.length} />
        <Stat label="Productos publicados" value={data.products.filter((item: any) => item.status === "PUBLISHED").length} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <h3 className="text-lg font-black text-gray-950">Solicitudes de vendedoras</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingApplications.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No hay solicitudes pendientes.</p>
          ) : (
            pendingApplications.map((app: any) => (
              <article key={app.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_240px]">
                <div>
                  <p className="text-lg font-black text-gray-950">{app.businessName}</p>
                  <p className="text-sm text-gray-500">{app.fullName} · {app.city} · {app.userEmail}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-700">{app.description}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">Productos: {app.productType}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => decide({ type: "application", id: app.id, decision: "APPROVED" })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white">
                    <CheckCircleIcon className="h-5 w-5" />
                    Aprobar
                  </button>
                  <button onClick={() => decide({ type: "application", id: app.id, decision: "REJECTED", note: "No aprobada por moderacion." })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white">
                    <XCircleIcon className="h-5 w-5" />
                    Rechazar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <h3 className="text-lg font-black text-gray-950">Productos pendientes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingProducts.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No hay productos pendientes.</p>
          ) : (
            pendingProducts.map((product: any) => (
              <article key={product.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_240px]">
                <div>
                  <p className="text-lg font-black text-gray-950">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category} · S/ {Number(product.price || 0).toFixed(2)}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-700">{product.description}</p>
                  {product.images?.[0] && <p className="mt-2 break-all text-xs text-gray-400">{product.images[0]}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => decide({ type: "product", id: product.id, decision: "PUBLISHED" })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white">
                    <CheckCircleIcon className="h-5 w-5" />
                    Publicar
                  </button>
                  <button onClick={() => decide({ type: "product", id: product.id, decision: "REJECTED", note: "No cumple politicas de publicacion." })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white">
                    <XCircleIcon className="h-5 w-5" />
                    Rechazar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-black text-gray-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-gray-500">{label}</p>
    </article>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = requireAdminPage(ctx);
  if (redirect) return redirect;
  return { props: {} };
};
