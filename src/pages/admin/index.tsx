import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
import { createPortal } from "react-dom";

interface Product {
  _id: number | string;
  code?: string;
  barcode?: string;
  stock?: number;
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
  interface DeleteTarget {
    id: number | string;
    code?: string;
    title: string;
  }

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingKey, setDeletingKey] = useState<string>("");
  const [confirmTarget, setConfirmTarget] = useState<DeleteTarget | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const remove = async (id: number | string, code?: string) => {
    const deleteToken = String(code || id || "").trim();
    if (!deleteToken) {
      setNotice({ type: "error", text: "No se pudo identificar el producto para eliminar." });
      return;
    }
    setDeletingKey(deleteToken);
    try {
      const qs = new URLSearchParams();
      const safeId = String(id ?? "").trim();
      const safeCode = String(code ?? "").trim();
      if (safeId && safeId !== "undefined" && safeId !== "null") qs.set("_id", safeId);
      if (safeCode) qs.set("code", safeCode);

      const res = await fetch(`/api/products?${qs.toString()}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setNotice({ type: "error", text: String(body?.error || "No se pudo eliminar el producto") });
        return;
      }

      setItems((prev) =>
        prev.filter((p) => {
          const pCode = String(p.code || "").trim();
          const pId = String(p._id ?? "").trim();
          return !(safeCode ? pCode === safeCode : pId === safeId);
        })
      );
      await load();
      setNotice({ type: "success", text: "Producto eliminado correctamente." });
    } finally {
      setDeletingKey("");
      setConfirmTarget(null);
    }
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const haystack = [
        p.title,
        p.code || "",
        p.barcode || "",
        p.category,
        p.brand,
        p.description,
        p.measure || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      {mounted && notice && createPortal(
        <div className="fixed right-6 top-20 z-[80]">
          <div
            className={`max-w-md rounded-lg border px-4 py-3 text-sm shadow-lg ${
              notice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <p>{notice.text}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-xs font-semibold opacity-80 hover:opacity-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Administrador de productos</h1>
        <Link href="/admin/new" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
          Nuevo producto
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Gestiona productos existentes y edita precios, descripciones e imágenes.</p>
          <p className="text-xs text-gray-500">Usa el botón Editar en cada producto.</p>
        </div>
        <a href="#product-list" className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold">
          Ver productos
        </a>
      </div>
      <div id="product-list" className="scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Listado de productos</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código, categoría o marca"
              className="w-full md:w-96 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {filteredItems.length}/{items.length} productos
            </span>
          </div>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-4">
            No hay productos para mostrar.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-4">
            No se encontraron productos con esa búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((p) => (
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
                {p.code && <p className="text-xs text-gray-500">Código: {p.code}</p>}
                {p.barcode && <p className="text-xs text-gray-500">Código barras: {p.barcode}</p>}
                <p className="text-xs text-gray-500">Stock: {Number(p.stock || 0)}</p>
                <p className="text-sm text-gray-600">{p.category}  {p.brand}</p>
                {p.measure && <p className="text-xs text-gray-500">Medidas: {p.measure}</p>}
                {(typeof p.priceBulk12 === "number" || typeof p.priceBulk3 === "number") && (
                  <p className="text-xs text-gray-500">X12: {typeof p.priceBulk12 === "number" ? p.priceBulk12 : "-"}  X3: {typeof p.priceBulk3 === "number" ? p.priceBulk3 : "-"}</p>
                )}
                <p className="text-sm text-gray-600 truncate">{p.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/admin/edit/${encodeURIComponent(String(p.code || p._id))}`} className="px-3 py-2 rounded-md bg-brand_teal text-white hover:opacity-90">Editar</Link>
                  <button
                    onClick={() => setConfirmTarget({ id: p._id, code: p.code, title: p.title })}
                    disabled={deletingKey === String(p.code || p._id)}
                    className="px-3 py-2 rounded-md bg-red-600 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingKey === String(p.code || p._id) ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-base font-semibold text-gray-900">Confirmar eliminación</p>
            <p className="mt-2 text-sm text-gray-600">
              Vas a eliminar <strong>{confirmTarget.title}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => remove(confirmTarget.id, confirmTarget.code)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={deletingKey === String(confirmTarget.code || confirmTarget.id)}
              >
                {deletingKey === String(confirmTarget.code || confirmTarget.id) ? "Eliminando..." : "Sí, eliminar"}
              </button>
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
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin", permanent: false } };
  }
  return { props: {} };
};
