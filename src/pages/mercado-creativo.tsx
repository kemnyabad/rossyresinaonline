import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const fallbackImage = "/favicon-96x96.png";

export default function MercadoCreativoPage() {
  const [data, setData] = useState<any>({ products: [], recent: [], featured: [], categories: [] });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  useEffect(() => {
    fetch("/api/marketplace/public", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setData(body))
      .catch(() => setData({ products: [], recent: [], featured: [], categories: [] }));
  }, []);

  const products = Array.isArray(data.products) ? data.products : [];
  const categories = ["Todas", ...(Array.isArray(data.categories) ? data.categories : [])];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product: any) => {
      const matchesCategory = category === "Todas" || product.category === category;
      const text = [product.name, product.category, product.description, product.shop?.commercialName].join(" ").toLowerCase();
      return matchesCategory && (!q || text.includes(q));
    });
  }, [products, query, category]);

  return (
    <>
      <Head>
        <title>Mercado Creativo Rossy Resina</title>
        <meta name="description" content="Descubre productos artesanales dentro del marketplace Rossy Resina." />
      </Head>
      <main className="bg-white text-slate-950">
        <section className="border-b border-pink-100 bg-[#fff4f9]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Mercado Creativo Rossy Resina</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
              Productos personalizados, piezas artesanales y creaciones únicas reunidas en un solo marketplace.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 grid gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar productos, tiendas o categorías" className="h-12 w-full rounded-lg border border-slate-200 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#e4147f]" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-[#e4147f]">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          {data.featured?.length > 0 && (
            <ProductSection title="Productos destacados" products={data.featured} />
          )}
          <ProductSection title="Productos recientes" products={data.recent || []} />
          <ProductSection title="Todos los productos" products={filtered} />
        </section>
      </main>
    </>
  );
}

function ProductSection({ title, products }: { title: string; products: any[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-black text-slate-950">{title}</h2>
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-pink-200 p-8 text-sm text-slate-500">Aun no hay productos publicados en esta sección.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const whatsapp = String(product.shop?.whatsapp || "").replace(/\D/g, "");
            const message = encodeURIComponent(`Hola, quiero consultar por el producto ${product.name} en Rossy Resina.`);
            return (
              <article key={product.id} className="group overflow-hidden rounded-xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <Link href={`/producto/${product.slug}`} className="block">
                  <div className="relative aspect-square bg-slate-100">
                    <img src={product.images?.[0] || fallbackImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/producto/${product.slug}`} className="block">
                    <p className="line-clamp-2 min-h-[44px] text-base font-black text-slate-950 group-hover:text-[#e4147f]">{product.name}</p>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">{product.shop?.commercialName || "Tienda Rossy Resina"}</p>
                  <p className="mt-3 text-lg font-black text-red-600">S/ {Number(product.price || 0).toFixed(2)}</p>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${message}`}
                      onClick={() => fetch("/api/marketplace/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "WHATSAPP_CLICK", shopId: product.shop?.id, productId: product.id }) })}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#e4147f] px-4 text-sm font-bold text-white"
                    >
                      Contactar
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
