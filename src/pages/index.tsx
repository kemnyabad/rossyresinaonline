import HeroCarousel from "@/components/HeroCarousel";
import Products from "@/components/Products";
import { ProductProps } from "../../type";
import { useDispatch } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import { setAllProducts } from "@/store/nextSlice";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { readCatalog } from "@/lib/catalogStore";

interface Props {
  productData: ProductProps[];
}

export default function Home({ productData }: Props) {
  const SITE_URL = "https://rossyresinaonlineweb.vercel.app";
  const pageTitle = "Rossy Resina | Resina epóxica, moldes y pigmentos en Perú";
  const pageDesc =
    "Compra resina epóxica, moldes de silicona, pigmentos y accesorios. Envío a todo Perú y atención por WhatsApp.";
  const dispatch = useDispatch();
  const allProducts = productData && productData.length > 0 ? productData : [];
  const [visibleCount, setVisibleCount] = useState(30);
  const diversifiedProducts = useMemo(() => {
    const detectGroup = (product: ProductProps) => {
      const text = `${product.title || ""} ${product.category || ""}`.toLowerCase();
      if (/(resina|epoxi|epoxica|pigmento|ecoresina|kit\s*resina)/.test(text)) return "Resina";
      if (/(dije|arete|pendiente|pulsera|collar|llavero|marcapaginas|lapicero|gancho|accesorio|anillo|rosario|porta\s*vela)/.test(text)) {
        return "Accesorios";
      }
      return "Moldes";
    };

    const buckets = new Map<string, ProductProps[]>();
    allProducts.forEach((product) => {
      const key = detectGroup(product);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(product);
    });
    const keys = Array.from(buckets.keys());
    const output: ProductProps[] = [];
    let pending = true;
    while (pending) {
      pending = false;
      for (const key of keys) {
        const bucket = buckets.get(key);
        if (bucket && bucket.length > 0) {
          output.push(bucket.shift() as ProductProps);
          pending = true;
        }
      }
    }
    return output;
  }, [allProducts]);
  const remateProducts = useMemo(() => {
    const withDiscount = allProducts.filter(
      (p) =>
        typeof p.oldPrice === "number" &&
        Number(p.oldPrice) > Number(p.price || 0) &&
        Number(p.price || 0) > 0
    );
    if (withDiscount.length >= 2) {
      return [...withDiscount]
        .sort((a, b) => {
          const da = Number(a.oldPrice || 0) - Number(a.price || 0);
          const db = Number(b.oldPrice || 0) - Number(b.price || 0);
          return db - da;
        })
        .slice(0, 2);
    }
    return allProducts.slice(0, 2);
  }, [allProducts]);
  const interestProducts = diversifiedProducts.slice(0, visibleCount);
  const interestsRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const normalizeImage = (img?: string) => {
    const s = String(img || "");
    if (!s) return `${SITE_URL}/favicon-96x96.png`;
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    const fixed = u.startsWith("/") ? u : `/${u}`;
    return `${SITE_URL}${fixed}`;
  };
  const keywordSet = new Set<string>([
    "resina epoxica",
    "resina uv",
    "moldes de silicona",
    "pigmentos",
    "accesorios resina",
    "manualidades",
  ]);
  allProducts.forEach((p) => {
    [p.title, p.category, p.brand].forEach((v) => {
      const t = String(v || "").trim();
      if (t) keywordSet.add(t);
    });
  });
  const keywords = Array.from(keywordSet).slice(0, 60).join(", ");
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catalogo de productos Rossy Resina",
    numberOfItems: allProducts.length,
    itemListElement: allProducts.slice(0, 200).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/${encodeURIComponent(String(p.code || p._id))}`,
      item: {
        "@type": "Product",
        name: p.title || p.code || "Producto",
        image: normalizeImage(p.image),
        category: p.category,
        brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
      },
    })),
  };
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Rossy Resina",
    url: SITE_URL,
    description: pageDesc,
    image: `${SITE_URL}/favicon-96x96.png`,
    keywords,
  };

  useEffect(() => {
    dispatch(setAllProducts({ allProducts: productData }));
  }, [productData, dispatch]);

  useEffect(() => {
    const el = interestsRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/favicon-96x96.png`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      </Head>
      <main>
        {/* Hero pegado al header */}
        <section className="w-full">
          <HeroCarousel remateProducts={remateProducts} />
        </section>

        <div className="max-w-screen-2xl mx-auto space-y-10 md:space-y-12 pb-10 pt-6 md:pt-8">
        {/* Ofertas relámpago */}
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="text-xl font-semibold uppercase tracking-wide text-[#cb299e]">
                Ofertas relámpago
              </h2>
            </div>
            <Link href="/productos" className="text-sm text-amazon_blue hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-flow-col auto-cols-[200px] justify-center gap-5 overflow-x-auto pb-2 sm:auto-cols-[220px]">
            {[
              {
                label: "Moldes kawaii",
                price: "S/ 11.32",
                oldPrice: "19.09",
                discount: "-40%",
              },
              {
                label: "Figuras decorativas",
                price: "S/ 17.73",
                oldPrice: "29.31",
                discount: "-39%",
              },
              {
                label: "Accesorios resina",
                price: "S/ 3.98",
                oldPrice: "8.04",
                discount: "-50%",
              },
              {
                label: "Pulsera premium",
                price: "S/ 4.05",
                oldPrice: "4.94",
                discount: "-18%",
              },
              {
                label: "Sandalias moldes",
                price: "S/ 36.91",
                oldPrice: "222.49",
                discount: "-83%",
              },
            ].map((o) => (
              <div
                key={o.label}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="h-36 bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wide flex items-center justify-center">
                  Producto en Proceso
                </div>
                <div className="px-3 py-2">
                  <div className="text-sm font-semibold text-gray-900 truncate">{o.label}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-red-600 font-semibold">{o.price}</span>
                    <span className="text-xs text-gray-400 line-through">S/ {o.oldPrice}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">{o.discount} tiempo limitado</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explora tus intereses */}
        <section className="px-4 md:px-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold uppercase tracking-wide">
              Explora tus intereses
            </h2>
          </div>
          <div className="relative">
            <div
              ref={interestsRef}
              className="no-scrollbar flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2 scroll-smooth"
            >
              {[
                "Moldes de silicona",
                "Moldes ecoresina",
                "Moldes jabones",
                "Moldes velas",
                "Resina epóxica",
                "Ecoresina",
                "Accesorios bisutería",
                "Accesorios eco resina",
                "Accesorios resina epóxica",
                "Accesorios manualidades",
              ].map((label) => (
                <span
                  key={label}
                  className="px-5 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-800"
                >
                  {label}
                </span>
              ))}
            </div>
            {canScrollLeft && (
              <button
                type="button"
                aria-label="Ver categorías anteriores"
                onClick={() => interestsRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Anterior</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto text-gray-700" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                aria-label="Ver más categorías"
                onClick={() => interestsRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Siguiente</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto text-gray-700" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Productos por intereses */}
        <section className="px-4 md:px-6">
          <Products
            productData={interestProducts}
            gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
          />
          {visibleCount < diversifiedProducts.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 30, diversifiedProducts.length))}
                className="px-6 py-3 rounded-full bg-amazon_blue text-white font-semibold hover:brightness-95"
              >
                Ver más
              </button>
            </div>
          )}
        </section>

        </div>
      </main>
    </>
  );
}

export const getServerSideProps = async () => {
  try {
    const productData = readCatalog();
    return { props: { productData } };
  } catch (e) {
    return { props: { productData: [] } };
  }
};
