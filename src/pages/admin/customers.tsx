import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type Customer = {
  dni: string;
  name: string;
  phone: string;
  locationLine: string;
  shippingCarrier: "SHALOM" | "OLVA";
  shalomAgency: string;
  olvaAddress: string;
  olvaReference: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resultLabel = useMemo(() => `${rows.length} cliente(s)`, [rows.length]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin - Clientes</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes registrados</h1>
        <span className="text-sm text-gray-500">{resultLabel}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, DNI, telefono o ubicacion"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={() => load(q.trim())}
            className="px-4 py-2 rounded bg-gray-900 text-white text-sm font-semibold"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setQ("");
              load();
            }}
            className="px-4 py-2 rounded border border-gray-300 text-sm font-semibold"
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">Cargando...</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          A?n no hay clientes registrados.
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((c) => (
            <div key={c.dni} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div><strong>DNI:</strong> {c.dni || "-"}</div>
                <div><strong>Telefono:</strong> {c.phone || "-"}</div>
                <div><strong>Ubicacion:</strong> {c.locationLine || "-"}</div>
                <div><strong>Agencia de env?o:</strong> {c.shippingCarrier === "OLVA" ? "Olva Courier" : "Shalom"}</div>
                {c.shippingCarrier === "SHALOM" ? (
                  <div><strong>Agencia Shalom:</strong> {c.shalomAgency || "-"}</div>
                ) : (
                  <>
                    <div><strong>Direccion Olva:</strong> {c.olvaAddress || "-"}</div>
                    <div><strong>Referencia Olva:</strong> {c.olvaReference || "-"}</div>
                  </>
                )}
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
  if (!ok) {
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/customers", permanent: false } };
  }
  return { props: {} };
};
