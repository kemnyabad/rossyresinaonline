import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: any[];
  customer: { name: string; email: string; phone: string; address: string; city: string; district: string; notes?: string };
  paymentImage?: string;
};

const statusOptions = [
  "Pendiente por confirmar",
  "Confirmado",
  "En proceso de envio",
  "Enviado",
  "Finalizado",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  const filteredOrders = statusFilter === "Todos"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin - Pedidos</title>
      </Head>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded border border-gray-300 bg-white"
          >
            <option value="Todos">Todos</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button onClick={loadOrders} className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50">Actualizar</button>
          <Link href="/admin" className="text-sm text-amazon_blue hover:underline">Volver</Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">Cargando...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          Todavia no hay pedidos registrados.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{o.customer?.name || "Cliente"}</div>
                <div className="text-xs text-gray-500">{o.customer?.email}</div>
                <div className="text-xs text-gray-500">{o.customer?.phone}</div>
                <div className="text-xs text-gray-500">Fecha: {o.date}</div>
                <div className="text-xs text-gray-500">Pedido: {o.id}</div>
                <div className="text-sm font-semibold">{o.status}</div>
              </div>

              <div className="mt-3 grid md:grid-cols-2 gap-4">
                <div className="text-sm text-gray-700">
                  <div className="mb-2"><strong>Cotizacion enviada:</strong></div>
                  <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                    {(o.items || []).map((it: any, idx: number) => (
                      <li key={`${o.id}-${idx}`}>
                        {it.title || "Producto"} x{Number(it.quantity || 1)} — S/ {Number(it.price || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <div><strong>Direccion:</strong> {o.customer?.address}, {o.customer?.district}, {o.customer?.city}</div>
                  {o.customer?.notes && <div><strong>Notas:</strong> {o.customer.notes}</div>}
                  <div className="mt-2"><strong>Total:</strong> S/ {Number(o.total || 0).toFixed(2)}</div>
                </div>
                <div>
                  {o.paymentImage ? (
                    <a href={o.paymentImage} target="_blank" rel="noreferrer" className="block">
                      <img src={o.paymentImage} alt="Comprobante" className="max-h-40 rounded border border-gray-200 hover:opacity-90" />
                      <p className="text-xs text-amazon_blue mt-1">Ver comprobante en grande</p>
                    </a>
                  ) : (
                    <div className="text-xs text-gray-500">Sin comprobante adjunto</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateStatus(o.id, s)}
                    className={
                      "px-3 py-1 rounded border text-xs " +
                      (o.status === s ? "border-orange-500 text-orange-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/orders", permanent: false } };
  return { props: {} };
};
