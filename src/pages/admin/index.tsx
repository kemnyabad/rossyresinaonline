import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";

interface Product {
  _id: number;
  code?: string;
  measure?: string;
  priceBulk12?: number;
  priceBulk3?: number;
  title: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  isNew: boolean;
  oldPrice?: number;
  price: number;
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await fetch(`/api/products?_id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Administrador de productos</h1>
        <Link href="/admin/new" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
          Nuevo producto
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Gestiona productos existentes y edita precios, descripciones e imagenes.</p>
          <p className="text-xs text-gray-500">Usa el boton “Editar” en cada producto.</p>
        </div>
        <a href="#product-list" className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold">
          Ver productos
        </a>
      </div>
      <div id="product-list" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Listado de productos</h2>
          <span className="text-xs text-gray-500">{items.length} productos</span>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-4">
            No hay productos para mostrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((p) => (
              <div key={p._id} className="bg-white rounded-lg border border-gray-200 p-4">
                {p.image && (
                  <Image
                    src={((): string => {
                      const s = String(p.image || "");
                      let u = s.replace(/\\/g, "/");
                      if (/^https?:\/\//i.test(u)) return u;
                      return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png";
                    })()}
                    alt={p.title}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <h2 className="mt-2 text-lg font-semibold">{p.title}</h2>
                {p.code && <p className="text-xs text-gray-500">Codigo: {p.code}</p>}
                <p className="text-sm text-gray-600">{p.category} · {p.brand}</p>
                {p.measure && <p className="text-xs text-gray-500">Medidas: {p.measure}</p>}
                {(typeof p.priceBulk12 === "number" || typeof p.priceBulk3 === "number") && (
                  <p className="text-xs text-gray-500">X12: {typeof p.priceBulk12 === "number" ? p.priceBulk12 : "-"} · X3: {typeof p.priceBulk3 === "number" ? p.priceBulk3 : "-"}</p>
                )}
                <p className="text-sm text-gray-600 truncate">{p.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/admin/edit/${p._id}`} className="px-3 py-2 rounded-md bg-brand_teal text-white hover:opacity-90">Editar</Link>
                  <button onClick={() => remove(p._id)} className="px-3 py-2 rounded-md bg-red-600 text-white hover:opacity-90">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin", permanent: false } };
  }
  return { props: {} };
};
