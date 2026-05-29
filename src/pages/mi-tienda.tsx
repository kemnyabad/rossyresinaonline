import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  ChartBarIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const emptyProduct = {
  id: "",
  name: "",
  category: "",
  price: "",
  description: "",
  imagesText: "",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PUBLISHED: "Publicado",
  PAUSED: "Pausado",
  REJECTED: "Rechazado",
};

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-slate-100 text-slate-700 border-slate-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function MiTiendaPage() {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);
  const [notice, setNotice] = useState("");
  const [productForm, setProductForm] = useState(emptyProduct);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/me", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setContext(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shop = context?.shop;
  const products = Array.isArray(context?.products) ? context.products : [];
  const stats = context?.stats || {};

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(data.entries());
    const res = await fetch("/api/marketplace/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNotice(res.ok ? "Perfil guardado correctamente." : "No se pudo guardar el perfil.");
    await load();
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      id: productForm.id,
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      description: productForm.description,
      images: productForm.imagesText.split("\n").map((line) => line.trim()).filter(Boolean),
    };
    const res = await fetch("/api/marketplace/products", {
      method: productForm.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNotice(res.ok ? "Producto enviado a revision." : "No se pudo guardar el producto.");
    if (res.ok) setProductForm(emptyProduct);
    await load();
  };

  const editProduct = (product: any) => {
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: String(product.price || ""),
      description: product.description,
      imagesText: Array.isArray(product.images) ? product.images.join("\n") : "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const productAction = async (id: string, action: "pause" | "reactivate" | "delete") => {
    const res =
      action === "delete"
        ? await fetch(`/api/marketplace/products?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        : await fetch("/api/marketplace/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action }),
          });
    setNotice(res.ok ? "Producto actualizado." : "No se pudo actualizar el producto.");
    await load();
  };

  const statCards = useMemo(
    () => [
      ["Productos publicados", stats.published || 0],
      ["Productos pendientes", stats.pending || 0],
      ["Visitas a la tienda", stats.shopViews || 0],
      ["Visitas a productos", stats.productViews || 0],
      ["Clics en WhatsApp", stats.whatsappClicks || 0],
    ],
    [stats]
  );

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600">Cargando Mi Tienda...</div>;

  if (!shop) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Head><title>Mi Tienda | Rossy Resina</title></Head>
        <div className="rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-sm">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-[#e4147f]" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">Tu tienda aun no esta activa</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Completa la solicitud o espera la aprobacion del equipo Rossy Resina.
          </p>
          <Link href="/vende-con-nosotros" className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#e4147f] px-5 text-sm font-bold text-white">
            Vende con nosotros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Mi Tienda | Rossy Resina</title></Head>
      <main className="bg-[#fff8fb]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">Panel de vendedora</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">Mi Tienda</h1>
              <p className="mt-2 text-sm text-slate-600">Gestiona tu perfil, productos y rendimiento dentro de Rossy Resina.</p>
            </div>
            <Link href={`/tienda/${shop.slug}`} className="inline-flex h-11 items-center gap-2 rounded-lg border border-pink-200 bg-white px-4 text-sm font-bold text-slate-900">
              <EyeIcon className="h-5 w-5 text-[#e4147f]" />
              Ver tienda publica
            </Link>
          </div>

          {notice && <div className="mb-5 rounded-xl border border-pink-200 bg-white p-4 text-sm font-semibold text-slate-800">{notice}</div>}

          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map(([label, value]) => (
              <article key={label} className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
                <ChartBarIcon className="h-5 w-5 text-[#e4147f]" />
                <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
              </article>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Perfil del emprendimiento</h2>
              <form onSubmit={submitProfile} className="mt-5 grid gap-4">
                <Input name="logoUrl" label="Logo" defaultValue={shop.logoUrl} />
                <Input name="commercialName" label="Nombre comercial" defaultValue={shop.commercialName} required />
                <Input name="city" label="Ciudad" defaultValue={shop.city} required />
                <label className="grid gap-2 text-sm font-bold text-slate-800">
                  Descripcion
                  <textarea name="description" defaultValue={shop.description} rows={4} className="rounded-lg border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#e4147f]" />
                </label>
                <Input name="whatsapp" label="WhatsApp" defaultValue={shop.whatsapp} required />
                <Input name="facebook" label="Facebook" defaultValue={shop.facebook} />
                <Input name="instagram" label="Instagram" defaultValue={shop.instagram} />
                <Input name="tiktok" label="TikTok" defaultValue={shop.tiktok} />
                <button className="h-11 rounded-lg bg-[#e4147f] px-5 text-sm font-bold text-white">Guardar cambios</button>
              </form>
            </section>

            <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-950">{productForm.id ? "Editar producto" : "Crear producto"}</h2>
                {productForm.id && (
                  <button onClick={() => setProductForm(emptyProduct)} className="text-sm font-bold text-[#e4147f]">Nuevo</button>
                )}
              </div>
              <form onSubmit={submitProduct} className="mt-5 grid gap-4">
                <Input label="Nombre" value={productForm.name} onChange={(value) => setProductForm((p) => ({ ...p, name: value }))} required />
                <Input label="Categoria" value={productForm.category} onChange={(value) => setProductForm((p) => ({ ...p, category: value }))} required />
                <Input label="Precio" type="number" value={productForm.price} onChange={(value) => setProductForm((p) => ({ ...p, price: value }))} required />
                <label className="grid gap-2 text-sm font-bold text-slate-800">
                  Descripcion
                  <textarea value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} rows={4} className="rounded-lg border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#e4147f]" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-800">
                  Fotografias multiples
                  <textarea value={productForm.imagesText} onChange={(e) => setProductForm((p) => ({ ...p, imagesText: e.target.value }))} rows={3} placeholder="Pega una URL de imagen por linea" className="rounded-lg border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#e4147f]" />
                </label>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white">
                  <PlusIcon className="h-5 w-5" />
                  {productForm.id ? "Guardar y enviar a revision" : "Crear producto"}
                </button>
              </form>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-pink-100 bg-white shadow-sm">
            <div className="border-b border-pink-100 p-5">
              <h2 className="text-xl font-black text-slate-950">Mis Productos</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">Aun no tienes productos creados.</p>
              ) : (
                products.map((product: any) => (
                  <article key={product.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                      {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-950">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category} · S/ {Number(product.price || 0).toFixed(2)}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[product.status] || statusClass.PENDING}`}>
                        {statusLabel[product.status] || product.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => editProduct(product)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"><PencilSquareIcon className="inline h-4 w-4" /> Editar</button>
                      {product.status !== "PAUSED" ? (
                        <button onClick={() => productAction(product.id, "pause")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Pausar</button>
                      ) : (
                        <button onClick={() => productAction(product.id, "reactivate")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"><ArrowPathIcon className="inline h-4 w-4" /> Reactivar</button>
                      )}
                      <button onClick={() => productAction(product.id, "delete")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600"><TrashIcon className="inline h-4 w-4" /> Eliminar</button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Input(props: any) {
  const { label, onChange, ...rest } = props;
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-800">
      {label}
      <input
        {...rest}
        onChange={onChange ? (e) => onChange(e.target.value) : rest.onChange}
        className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]"
      />
    </label>
  );
}
