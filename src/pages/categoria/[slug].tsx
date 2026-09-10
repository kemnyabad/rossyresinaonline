import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BeakerIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Products from "@/components/Products";
import MarketplaceProductGrid from "@/components/MarketplaceProductGrid";
import StoreWithAdsLayout from "@/components/store/StoreWithAdsLayout";
import type { ProductProps } from "../../../type";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getPublishedMarketplaceProducts } from "@/lib/marketplaceStore";
import { absoluteImageUrl, absoluteUrl, breadcrumbJsonLd, truncateMeta } from "@/lib/seo";
import { useLiveProducts } from "@/lib/useLiveProducts";

const slugToCategory: Record<string, string> = {
  resina: "Resinas",
  "moldes-de-silicona": "Moldes de silicona",
  pigmentos: "Pigmentos y glitters",
  accesorios: "Accesorios",
  creaciones: "Creaciones",
  talleres: "Escuela de formación en resina",
};

const categorySeo: Record<string, { title: string; description: string; intro: string }> = {
  resina: {
    title: "Resina epóxica y resina UV en Perú | Rossy Resina",
    description:
      "Compra resina epóxica, resina UV y materiales para artesanía en Rossy Resina. Productos para manualidades, bisutería y emprendimientos con envío a todo Perú.",
    intro:
      "Resina epóxica, resina UV y materiales para crear llaveros, dijes, bandejas, decoraciones y productos personalizados.",
  },
  "moldes-de-silicona": {
    title: "Moldes de silicona para resina en Perú | Rossy Resina",
    description:
      "Encuentra moldes de silicona para resina: llaveros, lapiceros shaker, dijes, botones, figuras y recuerdos personalizados con envío a todo Perú.",
    intro:
      "Moldes de silicona para trabajar resina epóxica y resina UV en proyectos de manualidades, recuerdos y productos para vender.",
  },
  pigmentos: {
    title: "Pigmentos para resina y glitters | Rossy Resina",
    description:
      "Compra pigmentos, micas, glitters y colorantes para resina. Materiales para dar color, brillo y acabado profesional a tus piezas.",
    intro:
      "Pigmentos, micas y glitters para dar color a piezas de resina, bisutería, llaveros y decoraciones artesanales.",
  },
  accesorios: {
    title: "Accesorios para resina y manualidades | Rossy Resina",
    description:
      "Accesorios para trabajar resina: vasos mezcladores, herramientas, insumos y complementos para piezas artesanales con envío en Perú.",
    intro:
      "Accesorios y herramientas para medir, mezclar, decorar y terminar piezas de resina con mejor presentación.",
  },
};

const toCategorySlug = (value: any): string =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface Props {
  slug: string;
  label: string | null;
  items: ProductProps[];
  marketplaceProducts: any[];
}

export default function CategoryPage({ slug, label, items, marketplaceProducts }: Props) {
  const { products: liveProducts } = useLiveProducts(items);
  if (slug === "talleres") {
    return <ResinEducationSchool />;
  }
  const targetSlug = toCategorySlug(label || slug);
  const visibleItems = label
    ? liveProducts
        .filter((p) => toCategorySlug(p.category) === targetSlug)
        .sort((a, b) => {
          const ac = (a.code || "").toString();
          const bc = (b.code || "").toString();
          if (ac && bc) return ac.localeCompare(bc, undefined, { numeric: true, sensitivity: "base" });
          if (ac) return -1;
          if (bc) return 1;
          return Number(a._id || 0) - Number(b._id || 0);
        })
    : [];
  const marketplaceItems = (marketplaceProducts || []).filter((product: any) => {
    if (slug === "creaciones") return true;
    return toCategorySlug(product.category) === targetSlug;
  });
  const seo = categorySeo[slug];
  const title = seo?.title || `${label || "Categoría"} para resina | Rossy Resina`;
  const description = truncateMeta(
    seo?.description ||
      (label
        ? `Compra ${label} en Rossy Resina. Encuentra productos para resina, manualidades, moldes, pigmentos y accesorios con envío a todo Perú.`
        : "Explora categorías de resina, moldes, pigmentos y accesorios en Rossy Resina.")
  );
  const canonical = absoluteUrl(`/categoria/${encodeURIComponent(slug)}`);
  const breadcrumbJson = breadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/productos" },
    { name: label || "Categoría", url: `/categoria/${encodeURIComponent(slug)}` },
  ]);
  const collectionJson = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    numberOfItems: visibleItems.length,
  };
  const itemListJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${label || "Productos"} en Rossy Resina`,
    itemListElement: visibleItems.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/${encodeURIComponent(String(product.slug || product.code || product._id))}`),
      name: product.title || product.code || "Producto",
    })),
  };

  return (
    <StoreWithAdsLayout className="py-8">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} key="description" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={absoluteImageUrl("/web-app-manifest-512x512.png")} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJson, collectionJson, itemListJson]) }}
        />
      </Head>

      <div className="min-w-0">
        {label ? (
          <>
            <h1 className="text-2xl font-semibold mb-4">{label}</h1>
            {seo?.intro && <p className="mb-5 max-w-3xl text-sm leading-6 text-gray-700">{seo.intro}</p>}
            <div className="space-y-8">
              {visibleItems.length > 0 ? (
                <Products productData={visibleItems} />
              ) : slug !== "creaciones" ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700">No hay productos en esta categoría por ahora.</p>
                </div>
              ) : null}
              {(slug === "creaciones" || marketplaceItems.length > 0) && (
                <MarketplaceProductGrid
                  products={marketplaceItems}
                  title={slug === "creaciones" ? "Productos del marketplace" : "Productos publicados"}
                  emptyText="Aun no hay productos publicados en esta categoría."
                />
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-700">Categoría no válida.</p>
            <div className="mt-4">
              <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
                Ir al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </StoreWithAdsLayout>
  );
}

export function ResinEducationSchool() {
  const modules = [
    {
      icon: BeakerIcon,
      title: "Clase 1",
      name: "Domina la mezcla",
      desc: "Proporciones, seguridad, pigmentos, burbujas y curado.",
      result: "Tu primera pieza queda limpia y sin errores básicos.",
      accent: "bg-amazon_blue",
    },
    {
      icon: PaintBrushIcon,
      title: "Clase 2",
      name: "Crea productos",
      desc: "Llaveros, joyería, bandejas, inclusiones y acabados.",
      result: "Armas piezas vendibles con mejor presentación.",
      accent: "bg-amazon_blue",
    },
    {
      icon: BriefcaseIcon,
      title: "Clase 3",
      name: "Vende con método",
      desc: "Costos, precios, catálogo, empaque, atención y redes.",
      result: "Empiezas a mirar tu resina como emprendimiento.",
      accent: "bg-amazon_blue",
    },
  ];
  const [activeModule, setActiveModule] = useState(0);
  const ActiveIcon = modules[activeModule].icon;

  const benefits = [
    { icon: BanknotesIcon, value: "S/ 50", label: "mensuales" },
    { icon: CalendarDaysIcon, value: "3 clases", label: "cada mes" },
    { icon: BriefcaseIcon, value: "Negocio", label: "incluido" },
  ];

  const businessTopics = [
    "Costos",
    "Precios",
    "Fotos",
    "Empaque",
    "Redes",
    "Ventas",
  ];

  return (
    <StoreWithAdsLayout className="py-8">
      <Head>
        <title>Escuela de formación en resina - Rossy Resina</title>
        <meta
          name="description"
          key="description"
          content="Escuela de formación para el trabajo en artesanía en resina. Aprende técnicas, seguridad, producción artesanal y emprendimiento."
        />
        <link rel="canonical" href={absoluteUrl("/capacitaciones")} />
        <meta property="og:title" content="Escuela de formación en resina - Rossy Resina" />
        <meta
          property="og:description"
          content="Formación práctica en artesanía en resina para aprender, crear y emprender."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={absoluteUrl("/capacitaciones")} />
        <meta property="og:image" content={absoluteImageUrl("/web-app-manifest-512x512.png")} />
      </Head>

      <div className="min-w-0 space-y-10">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(17,24,39,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_430px]">
            <div className="relative px-6 py-8 md:px-10 md:py-12">
              <div className="rr-type-label inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-amazon_blue shadow-sm">
                <AcademicCapIcon className="h-4 w-4" />
                Escuela para crear y vender
              </div>
              <h1 className="rr-type-display mt-5 max-w-3xl text-3xl md:text-5xl">
                Formación en resina para empezar tu propio camino artesanal
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
                Tres clases al mes, práctica guiada y herramientas de negocio para convertir tus piezas en productos.
              </p>

              <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
                {benefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white bg-white p-4 shadow-sm">
                      <Icon className="h-6 w-6 text-amazon_blue" />
                      <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
                      <p className="rr-type-label text-slate-500">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-amazon_blue px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(203,41,158,0.20)] hover:bg-amazon_light"
                >
                  Reservar cupo
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModule((activeModule + 1) % modules.length)}
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-amazon_blue hover:text-amazon_blue"
                >
                  Ver siguiente clase
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6 lg:border-l lg:border-t-0">
              <div className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="rr-type-label text-amazon_blue">Programa mensual</p>
                <div className="mt-4 rounded-lg bg-slate-950 p-5 text-white">
                  <p className="text-sm font-semibold text-white/70">Inscripción</p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-5xl font-bold leading-none">S/ 50</span>
                    <span className="pb-1 text-sm font-medium text-white/75">mensual</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {modules.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <button
                        key={module.title}
                        type="button"
                        onClick={() => setActiveModule(index)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                          activeModule === index
                            ? "border-amazon_blue bg-pink-50"
                            : "border-slate-200 bg-slate-50 hover:border-gray-300"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amazon_blue">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="rr-type-label block text-slate-500">
                            {module.title}
                          </span>
                          <span className="block text-sm font-semibold text-slate-950">{module.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-950">Incluye cursos complementarios de negocio</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">Costos, precios, fotos, empaque, redes y ventas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Elige un módulo</h2>
            <div className="mt-4 grid gap-2">
              {modules.map((module, index) => {
                const Icon = module.icon;
                const active = activeModule === index;
                return (
                  <button
                    key={module.title}
                    type="button"
                    onClick={() => setActiveModule(index)}
                    className={`group flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                      active
                        ? "border-amazon_blue bg-pink-50 shadow-[0_6px_16px_rgba(17,24,39,0.08)]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        active ? "bg-amazon_blue text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="rr-type-label block text-amazon_blue">
                        {module.title}
                      </span>
                      <span className="block text-sm font-semibold text-slate-950">{module.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className={`absolute inset-x-0 top-0 h-1 ${modules[activeModule].accent}`} />
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${modules[activeModule].accent} text-white shadow-[0_8px_18px_rgba(203,41,158,0.20)]`}>
                <ActiveIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="rr-type-label text-amazon_blue">
                  {modules[activeModule].title}
                </p>
                <h3 className="rr-type-title text-2xl">{modules[activeModule].name}</h3>
              </div>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-700">{modules[activeModule].desc}</p>
            <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm font-semibold leading-6 text-emerald-950">{modules[activeModule].result}</p>
              </div>
            </div>
            <div className="mt-7">
              <div className="rr-type-label mb-2 flex items-center justify-between text-slate-500">
                <span>Ruta mensual</span>
                <span>{activeModule + 1}/3</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${modules[activeModule].accent} transition-all duration-500`}
                  style={{ width: `${((activeModule + 1) / modules.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="p-6 md:p-8">
              <p className="rr-type-label text-amazon_blue">Complemento de negocio</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">No solo aprenden a hacer piezas. Aprenden a venderlas.</h2>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {businessTopics.map((tag) => (
                  <span key={tag} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-700 hover:border-amazon_blue hover:bg-pink-50 hover:text-amazon_blue">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-950 p-6 text-white md:p-8">
              <p className="rr-type-label text-pink-100">Cupos en preparación</p>
              <h3 className="mt-3 text-3xl font-bold">S/ 50 mensual</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">Incluye 3 clases al mes y cursos complementarios de emprendimiento.</p>
              <Link
                href="/contact"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-pink-50"
              >
                Quiero aprender resina
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StoreWithAdsLayout>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const slug: string = String(ctx.params.slug || "");

  if (slug === "talleres") {
    return { redirect: { destination: "/capacitaciones", permanent: false } };
  }

  try {
    const [all, marketplaceProducts]: [ProductProps[], any[]] = await Promise.all([
      getAllProducts(),
      getPublishedMarketplaceProducts(),
    ]);
    const categories = Array.from(
      new Set(
        all
          .map((p) => String(p.category || "").trim())
          .filter(Boolean)
      )
    );

    const mappedLabel = slugToCategory[slug] || null;
    const matchedBySlug = categories.find((c) => toCategorySlug(c) === slug) || null;
    const label = mappedLabel || matchedBySlug;

    const targetSlug = toCategorySlug(label || slug);
    const items = label
      ? all.filter((p) => toCategorySlug(p.category) === targetSlug)
      : [];

    items.sort((a, b) => {
      const ac = (a.code || "").toString();
      const bc = (b.code || "").toString();
      if (ac && bc) return ac.localeCompare(bc, undefined, { numeric: true, sensitivity: "base" });
      if (ac) return -1;
      if (bc) return 1;
      return Number(a._id || 0) - Number(b._id || 0);
    });

    if (!label && slug !== "creaciones") return { notFound: true };

    return { props: { slug, label, items, marketplaceProducts: JSON.parse(JSON.stringify(marketplaceProducts)) } };
  } catch (e) {
    return { props: { slug, label: null, items: [], marketplaceProducts: [] } };
  }
};
