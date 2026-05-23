import HeroCarousel from "@/components/HeroCarousel";
import Products from "@/components/Products";
import StoreWithAdsLayout from "@/components/store/StoreWithAdsLayout";
import { ProductProps } from "../../type";
import { useDispatch } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import { setAllProducts } from "@/store/nextSlice";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  QuestionMarkCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import {
  getOfferProducts,
} from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getPurchaseBehaviorSnapshot, type PurchaseBehaviorSnapshot } from "@/lib/repositories/categoryInsightsRepository";
import { getSmartProductRecommendations, type SmartRecommendation } from "@/lib/smartCatalog";

interface Props {
  productData: ProductProps[];
  behavior: PurchaseBehaviorSnapshot;
  ofertasExpress: { id: string; nombre: string; imagen: string }[];
}

export default function Home({ productData, behavior, ofertasExpress }: Props) {
  const SITE_URL = "https://rossyresinaonlineweb.vercel.app";
  const pageTitle = "Rossy Resina | Resina epóxica, moldes y pigmentos en Perú";
  const pageDesc =
    "Compra resina epóxica, moldes de silicona, pigmentos y accesorios. Envío a todo Perú y atención por WhatsApp.";
  const dispatch = useDispatch();
  const allProducts = useMemo(
    () => (productData && productData.length > 0 ? productData : []),
    [productData]
  );
  const [visibleCount, setVisibleCount] = useState(30);
  
  // Carousel refs
  const visitedCarouselRef = useRef<HTMLDivElement>(null);
  const topProductsRef = useRef<HTMLDivElement>(null);
  
  // Carousel scroll function
  const scrollMobile = (direction: 'left' | 'right', carousel: 'visited') => {
    const ref = visitedCarouselRef;
    if (!ref.current) return;
    
    const scrollAmount = 160; // Width of one card + gap
    const currentScroll = ref.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;
    
    ref.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };
  
  // Desktop carousel scroll function
  const scrollDesktop = (direction: 'left' | 'right', carousel: 'topProducts') => {
    if (carousel === 'topProducts' && topProductsRef.current) {
      const scrollAmount = 270; // Width of one desktop card + gap
      const currentScroll = topProductsRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      topProductsRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };
  const diversifiedProducts = useMemo(() => {
    const detectGroup = (product: ProductProps) => {
      const text = `${product.title || ""} ${product.category || ""}`.toLowerCase();
      if (/(resina|epoxi|epóxica|ep?xica|pigmento|ecoresina|kit\s*resina)/.test(text)) return "Resina";
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
  const productByLookup = useMemo(() => {
    const map = new Map<string, ProductProps>();
    for (const p of allProducts) {
      const idKey = String(p._id || "").trim();
      const codeKey = String(p.code || "").trim();
      if (idKey) map.set(idKey, p);
      if (codeKey) map.set(codeKey, p);
    }
    return map;
  }, [allProducts]);

  const realTopProducts = useMemo(() => {
    const keys = Array.isArray(behavior?.topProductKeys) ? behavior.topProductKeys : [];
    return keys.map((k) => productByLookup.get(String(k))).filter(Boolean) as ProductProps[];
  }, [behavior?.topProductKeys, productByLookup]);

  const offerProducts = useMemo(() => getOfferProducts(allProducts, 10), [allProducts]);

  const hasBehaviorData = !!behavior?.hasRealData;
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
  const topVisitedForHero = useMemo(() => {
    if (realTopProducts.length > 0) return realTopProducts.slice(0, 8);
    if (offerProducts.length > 0) return offerProducts.slice(0, 8);
    return allProducts.slice(0, 8);
  }, [realTopProducts, offerProducts, allProducts]);
  const mobileTopVisited = useMemo(
    () => (realTopProducts.length > 0 ? realTopProducts : allProducts).slice(0, 8),
    [realTopProducts, allProducts]
  );
  const smartRecommendations = useMemo<SmartRecommendation[]>(() => {
    const signalText = hasBehaviorData && behavior.topCategories.length > 0
      ? `emprender con ${behavior.topCategories.slice(0, 3).join(" ")}`
      : "principiante empezar resina moldes pigmentos kit";
    return getSmartProductRecommendations(
      allProducts,
      signalText,
      6,
      behavior.topProductKeys || []
    );
  }, [allProducts, behavior.topCategories, behavior.topProductKeys, hasBehaviorData]);

  const moldProductsForHero = useMemo(() => {
    return allProducts.filter((p) => {
      const cat = String(p?.category || "").toLowerCase();
      const title = String(p?.title || "").toLowerCase();
      const code = String(p?.code || "").toLowerCase();
      return cat.includes("molde") || title.includes("molde") || code.includes("mol_");
    });
  }, [allProducts]);
  const interestProducts = diversifiedProducts.slice(0, visibleCount);
  const normalizeImage = (img?: string) => {
    const s = String(img || "");
    if (!s) return `${SITE_URL}/favicon-96x96.png`;
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    const fixed = u.startsWith("/") ? u : `/${u}`;
    return `${SITE_URL}${fixed}`;
  };
  const normalizeMobileImage = (img?: string) => {
    const s = String(img || "");
    if (!s) return "/favicon-96x96.png";
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    return u.startsWith("/") ? u : `/${u}`;
  };
  const keywordSet = new Set<string>([
    "resina epóxica",
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
  const mobileCategories = [
    { label: "Todo", href: "/" },
    { label: "Moldes", href: "/categoria/moldes-de-silicona" },
    { label: "Resina", href: "/categoria/resina" },
    { label: "Pigmentos", href: "/categoria/pigmentos" },
    { label: "Accesorios", href: "/categoria/accesorios" },
    { label: "Escuela", href: "/escuela" },
  ];
  const lightningProducts = (offerProducts.length > 0 ? offerProducts : allProducts).slice(0, 8);
  const mobileGridProducts = interestProducts.slice(0, 20);
  const getDiscountLabel = (product: ProductProps) => {
    const oldPrice = Number(product.oldPrice || 0);
    const price = Number(product.price || 0);
    if (oldPrice > price && oldPrice > 0) return `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
    return "Oferta";
  };

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
      </Head>
      <main>
        {/* Home mobile storefront */}
        <section className="md:hidden bg-white pb-3">
          <nav className="no-scrollbar flex gap-6 overflow-x-auto border-b border-gray-100 px-4 pt-1 text-[15px] font-medium text-gray-500">
            {mobileCategories.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border-b-[3px] pb-2 ${
                  index === 0 ? "border-amazon_blue font-semibold text-amazon_blue" : "border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="grid grid-cols-2 border-b border-gray-200 bg-white px-4 py-2">
            <Link href="/resiny" className="flex items-start gap-2 border-r border-gray-200 pr-3">
              <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-amazon_blue" />
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-amazon_blue">Resiny</span>
                <span className="block truncate text-xs text-gray-600">Asistente IA</span>
              </span>
            </Link>
            <a
              href="https://chat.whatsapp.com/LL8QQddRrGYLxuV8j7BnBA"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 pl-3"
            >
              <UserGroupIcon className="mt-0.5 h-5 w-5 shrink-0 text-amazon_light" />
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-gray-900">Comunidad</span>
                <span className="block truncate text-xs text-gray-600">Grupo WhatsApp</span>
              </span>
            </a>
          </div>

          <Link
            href="/proceso-envio"
            className="mx-4 mt-2 flex h-11 items-center gap-3 overflow-hidden rounded-md bg-amazon_blue px-3 text-white"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <TruckIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold">
              Entrega rápida
              <span className="ml-2 font-semibold text-white/90">Soporte ante inconvenientes</span>
            </span>
            <CheckBadgeIcon className="h-6 w-6 shrink-0 text-white/85" />
            <QuestionMarkCircleIcon className="h-5 w-5 shrink-0 text-white/75" />
          </Link>

          <section className="mt-3">
            <div className="mb-2 flex items-center justify-between px-4">
              <h2 className="text-base font-bold text-amazon_blue">
                Super ofertas
              </h2>
              <Link href="/productos?ofertas=1" className="text-sm text-gray-700">Por tiempo limitado</Link>
            </div>
            <div
              ref={visitedCarouselRef}
              className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2"
              style={{ scrollBehavior: "smooth" }}
            >
              {lightningProducts.map((p) => (
                <Link key={`flash-${p._id}`} href={`/${p.code || p._id}`} className="w-[132px] shrink-0">
                  <div className="relative h-[132px] overflow-hidden rounded-sm bg-gray-100">
                    <Image src={normalizeMobileImage(p.image)} alt={p.title || "Producto"} fill className="object-cover" />
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-900">{getDiscountLabel(p)} especial</p>
                  <div className="flex items-center gap-1">
                    <p className="min-w-0 flex-1 text-[15px] font-bold leading-tight text-amazon_blue">
                      S/ {Number(p.price || 0).toFixed(2)}
                      <span className="ml-1 text-xs font-medium text-gray-500">c/u</span>
                    </p>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amazon_blue bg-white text-amazon_blue">
                      <ShoppingCartIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1.5">
            {mobileGridProducts.map((p) => (
              <Link key={`mobile-grid-${p._id}`} href={`/${p.code || p._id}`} className="min-w-0 bg-white">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <Image src={normalizeMobileImage(p.image)} alt={p.title || "Producto"} fill className="object-cover" />
                  {typeof p.oldPrice === "number" && p.oldPrice > p.price ? (
                    <span className="absolute left-1.5 top-1.5 rounded-sm bg-amazon_blue px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {getDiscountLabel(p)}
                    </span>
                  ) : null}
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 min-h-[32px] text-xs font-medium leading-4 text-gray-900">{p.title || "Producto"}</p>
                  <div className="mt-1 flex items-end gap-1">
                    <p className="text-lg font-bold leading-none text-amazon_blue">S/ {Number(p.price || 0).toFixed(2)}</p>
                    <span className="pb-0.5 text-[10px] text-gray-500">c/u</span>
                    <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amazon_blue bg-white text-amazon_blue">
                      <ShoppingCartIcon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                    <TruckIcon className="h-3.5 w-3.5 text-amazon_blue" />
                    Envío disponible
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <div className="mt-4 flex justify-center">
            <Link href="/productos" className="inline-flex h-10 items-center justify-center rounded-full bg-amazon_blue px-6 text-sm font-semibold text-white">
              Ver más productos
            </Link>
          </div>
        </section>

        <section className="hidden md:block">
          <StoreWithAdsLayout className="pb-10 pt-6">
            <div className="space-y-6 md:space-y-8">
              <section className="w-full">
                <HeroCarousel
                  productData={allProducts}
                  remateProducts={remateProducts}
                  topVisitedProducts={topVisitedForHero}
                  moldProducts={moldProductsForHero}
                  ofertasExpress={ofertasExpress}
                />
              </section>
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">
              Productos más comprados
            </h2>
            <Link href="/productos" className="text-sm font-semibold text-amazon_blue hover:underline">
              Ver todos
            </Link>
          </div>
          {hasBehaviorData && realTopProducts.length > 0 ? (
            <div className="relative">
              {/* Desktop navigation buttons */}
              <button
                onClick={() => scrollDesktop('left', 'topProducts')}
                className="absolute left-0 top-1/2 z-10 hidden -translate-x-3 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-[0_6px_16px_rgba(17,24,39,0.10)] transition-all duration-200 hover:bg-gray-50 md:flex"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollDesktop('right', 'topProducts')}
                className="absolute right-0 top-1/2 z-10 hidden translate-x-3 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-[0_6px_16px_rgba(17,24,39,0.10)] transition-all duration-200 hover:bg-gray-50 md:flex"
                aria-label="Siguiente"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                ref={topProductsRef}
                className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                {realTopProducts.map((product) => (
                  <div key={product._id} className="w-[200px] md:w-[250px] shrink-0">
                    <Products productData={[product]} gridClass="grid-cols-1" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-1 text-sm text-gray-600">
              Aún no hay compras confirmadas para mostrar productos más comprados.
            </div>
          )}
        </section>

        {/* Ofertas Express */}
        {ofertasExpress.length > 0 && (
        <section className="px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚡</span>
            <h2 className="text-xl font-bold text-amazon_blue">Ofertas Express</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {ofertasExpress.map((item) => (
              <div key={item.id} className="group rounded-lg border border-gray-200 bg-white p-2 shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amazon_blue/45 hover:shadow-[0_8px_18px_rgba(17,24,39,0.10)]">
                <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-50">
                  <Image src={item.imagen} alt={item.nombre} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="bg-amazon_blue text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">EXPRESS</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-gray-800 text-center line-clamp-2 group-hover:text-amazon_blue transition-colors">{item.nombre}</p>
              </div>
            ))}
          </div>
        </section>
        )}

        {smartRecommendations.length > 0 && (
        <section className="px-4 md:px-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="rr-type-label text-amazon_blue">Resiny analiza tu tienda</p>
              <h2 className="text-xl font-bold text-gray-900">Recomendados con intención</h2>
            </div>
            <Link href="/resiny" className="text-sm font-semibold text-amazon_blue hover:underline">
              Pedir asesoría
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {smartRecommendations.slice(0, 3).map(({ product, reason }) => (
              <Link
                key={`smart-${product._id}`}
                href={`/${product.code || product._id}`}
                className="group grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amazon_blue/45 hover:shadow-[0_10px_22px_rgba(17,24,39,0.10)]"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-gray-50">
                  <Image src={normalizeMobileImage(product.image)} alt={product.title || "Producto recomendado"} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-gray-950 group-hover:text-amazon_blue">{product.title}</p>
                  <p className="mt-1 text-sm font-semibold text-amazon_blue">S/ {Number(product.price || 0).toFixed(2)}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600">{reason}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

            </div>
          </StoreWithAdsLayout>

          <div className="mx-auto max-w-screen-2xl space-y-6 px-4 pb-10 md:px-6">
            {/* Productos por intereses */}
            <section>
              <div className="relative mb-4 flex items-center justify-center">
                <h2 className="text-center text-xl font-bold text-gray-900">
                  Explora tus intereses
                </h2>
                <Link href="/productos" className="absolute right-0 text-sm font-semibold text-amazon_blue hover:underline">
                  Ver catálogo
                </Link>
              </div>
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
        </section>
      </main>
    </>
  );
}

export const getServerSideProps = async () => {
  try {
    const productData = await getAllProducts();
    const behavior = await getPurchaseBehaviorSnapshot(8, 12, 180);
    const prisma = (await import("@/lib/prisma")).default as any;
    const ofertasExpress = await prisma.ofertaExpress.findMany({
      where: { activo: true },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      select: { id: true, nombre: true, imagen: true },
    });
    return { props: { productData, behavior, ofertasExpress: JSON.parse(JSON.stringify(ofertasExpress)) } };
  } catch (e) {
    return {
      props: {
        productData: [],
        behavior: {
          hasRealData: false,
          topCategories: [],
          topProductKeys: [],
          topOfferProductKeys: [],
        } as PurchaseBehaviorSnapshot,
        ofertasExpress: [],
      },
    };
  }
};
