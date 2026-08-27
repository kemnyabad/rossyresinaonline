import HeroCarousel from "@/components/HeroCarousel";
import Products from "@/components/Products";
import MarketplaceProductGrid from "@/components/MarketplaceProductGrid";
import StoreWithAdsLayout from "@/components/store/StoreWithAdsLayout";
import { ProductProps } from "../../type";
import { useDispatch } from "react-redux";
import { type ElementType, useEffect, useMemo, useRef, useState } from "react";
import { setAllProducts } from "@/store/nextSlice";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { FaClock } from "react-icons/fa";
import {
  getOfferProducts,
} from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getPublishedMarketplaceProducts } from "@/lib/marketplaceStore";
import { getActiveOfertasExpress, type OfertaExpressItem } from "@/lib/ofertasExpress";
import { getPurchaseBehaviorSnapshot, type PurchaseBehaviorSnapshot } from "@/lib/repositories/categoryInsightsRepository";
import { absoluteImageUrl, absoluteUrl, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { useLiveProducts } from "@/lib/useLiveProducts";

interface Props {
  productData: ProductProps[];
  behavior: PurchaseBehaviorSnapshot;
  marketplaceProducts: any[];
  ofertasExpress: OfertaExpressItem[];
  promotionSeed: string;
}

function promotionKey(item: ProductProps) {
  return String(item.code || item._id || item.title || "");
}

function hashPromotionValue(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shufflePromotionItems<T extends ProductProps>(items: T[], seed: string): T[] {
  return [...items].sort((a, b) => {
    const scoreA = hashPromotionValue(`${seed}:${promotionKey(a)}`);
    const scoreB = hashPromotionValue(`${seed}:${promotionKey(b)}`);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return promotionKey(a).localeCompare(promotionKey(b));
  });
}

export default function Home({ productData, behavior, marketplaceProducts, ofertasExpress, promotionSeed }: Props) {
  const pageTitle = "Rossy Resina | Resina epóxica, moldes y pigmentos en Perú";
  const pageDesc =
    "Compra resina epóxica, moldes de silicona, pigmentos y accesorios. Envío a todo Perú y atención por WhatsApp.";
  const dispatch = useDispatch();
  const { products: liveProductData } = useLiveProducts(productData);
  const allProducts = useMemo(
    () => (liveProductData && liveProductData.length > 0 ? liveProductData : []),
    [liveProductData]
  );
  const [visibleCount, setVisibleCount] = useState(30);
  const [mobilePromoIndex, setMobilePromoIndex] = useState(0);
  
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

  const offerProducts = useMemo(() => shufflePromotionItems(getOfferProducts(allProducts, Math.max(allProducts.length, 1)), promotionSeed), [allProducts, promotionSeed]);

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
    if (!s) return absoluteImageUrl("/favicon-96x96.png");
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    const fixed = u.startsWith("/") ? u : `/${u}`;
    return absoluteUrl(fixed);
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
  const mobileGridProducts = interestProducts.slice(0, 20);
  const mobilePromoSlides = useMemo(
    () => [
      {
        href: "/proceso-envio",
        title: "Entrega rápida",
        text: "Soporte ante inconvenientes",
        icon: TruckIcon,
        endIcon: CheckBadgeIcon,
      },
    ],
    []
  );
  useEffect(() => {
    const timer = window.setInterval(() => {
      setMobilePromoIndex((prev) => (prev + 1) % mobilePromoSlides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [mobilePromoSlides.length]);
  const getDiscountLabel = (product: ProductProps) => {
    const oldPrice = Number(product.oldPrice || 0);
    const price = Number(product.price || 0);
    if (oldPrice > price && oldPrice > 0) return `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
    return "Oferta";
  };

  const categoryShowcasePanels = useMemo(() => {
    const buckets = new Map<string, ProductProps[]>();
    allProducts.forEach((p) => {
      const cat = String(p.category || "").trim();
      if (!cat) return;
      if (!buckets.has(cat)) buckets.set(cat, []);
      buckets.get(cat)!.push(p);
    });
    return Array.from(buckets.entries())
      .map(([name, items]) => ({ name, items: shufflePromotionItems(items, promotionSeed).slice(0, 3) }))
      .filter((c) => c.items.length >= 3)
      .sort((a, b) => b.items.length - a.items.length)
      .slice(0, 2);
  }, [allProducts, promotionSeed]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} key="description" />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={absoluteUrl("/")} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={absoluteUrl("/")} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={absoluteImageUrl("/web-app-manifest-512x512.png")} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]) }}
        />
      </Head>
      <main>
        <h1 className="sr-only">Rossy Resina - resina epóxica, moldes de silicona y pigmentos en Perú</h1>
        <OfertasExpressSection items={ofertasExpress} />
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
              <ChatBubbleLeftRightIcon className="rr-icon-float mt-0.5 h-5 w-5 shrink-0 text-amazon_blue" />
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
              <UserGroupIcon className="rr-icon-float mt-0.5 h-5 w-5 shrink-0 text-amazon_light" />
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-gray-900">Comunidad</span>
                <span className="block truncate text-xs text-gray-600">Grupo WhatsApp</span>
              </span>
            </a>
          </div>

          <MobilePromoSlider
            slides={mobilePromoSlides}
            activeIndex={mobilePromoIndex}
            onSelect={setMobilePromoIndex}
          />


          <section className="columns-2 gap-1.5 bg-gray-100 p-1.5">
            {mobileGridProducts.map((p) => (
              <Link key={`mobile-grid-${p._id}`} href={`/${p.slug || p.code || p._id}`} className="mb-1.5 inline-block w-full min-w-0 break-inside-avoid bg-white align-top">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <Image src={normalizeMobileImage(p.image)} alt={p.title || "Producto"} fill className="object-cover" />
                  {typeof p.oldPrice === "number" && p.oldPrice > p.price ? (
                    <>
                      <span className="absolute left-1.5 top-1.5 rounded-sm bg-amazon_blue px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {getDiscountLabel(p)}
                      </span>
                      <span className="absolute bottom-0 left-0 flex h-7 w-[58px] items-center justify-center rounded-tr-xl bg-yellow-300 px-1 text-center text-[10px] font-black leading-[10px] text-amazon_blue shadow-[0_-2px_8px_rgba(17,24,39,0.18)]">
                        Mega<br />Oferta
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-xs font-medium leading-4 text-gray-900">{p.title || "Producto"}</p>
                  <div className="mt-1 flex items-end gap-1">
                    <p className="text-lg font-bold leading-none text-amazon_blue">S/ {Number(p.price || 0).toFixed(2)}</p>
                    <span className="pb-0.5 text-[10px] text-gray-500">c/u</span>
                    {typeof p.oldPrice === "number" && p.oldPrice > p.price ? (
                      <span className="pb-0.5 text-[10px] text-gray-400 line-through">
                        S/ {Number(p.oldPrice || 0).toFixed(2)}
                      </span>
                    ) : null}
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
          <StoreWithAdsLayout className="pb-2 pt-3">
            <div className="space-y-6 md:space-y-8">
              <section className="w-full">
                <HeroCarousel
                  productData={allProducts}
                  remateProducts={remateProducts}
                  topVisitedProducts={topVisitedForHero}
                  moldProducts={moldProductsForHero}
                />
              </section>
        {hasBehaviorData && realTopProducts.length > 0 && (
        <section className="px-4 md:px-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">
                Productos más comprados
              </h2>
            </div>
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
        </section>
        )}

        {marketplaceProducts.length > 0 && (
          <section className="px-4 md:px-6">
            <MarketplaceProductGrid
              products={marketplaceProducts.slice(0, 10)}
              title="Productos del marketplace"
            />
          </section>
        )}

            </div>
          </StoreWithAdsLayout>

          <div className="mx-auto max-w-screen-2xl space-y-6 px-4 pb-10 md:px-6">
            <CategoryShowcaseSection panels={categoryShowcasePanels} />

            {/* Productos por intereses */}
            <section>
              <div className="mb-4 flex items-center justify-center">
                <h2 className="text-center text-xl font-bold text-gray-900">
                  Explora tus intereses
                </h2>
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

function OfertasExpressSection({ items }: { items: OfertaExpressItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 220;
    el.scrollTo({
      left: direction === "left" ? el.scrollLeft - amount : el.scrollLeft + amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-b border-gray-100 bg-white px-4 py-4 md:px-6">
      <div className="mx-auto max-w-screen-2xl">
        <div className="relative mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-gray-950 md:text-xl">
            <FaClock className="text-red-600" />
            Ofertas Express
          </h2>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Ver ofertas anteriores"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-amazon_blue hover:text-amazon_blue"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Ver más ofertas"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-amazon_blue hover:text-amazon_blue"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[42%] shrink-0 snap-start sm:w-[28%] md:w-[19%] lg:w-[15%]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Express
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 pb-2 pt-8">
                  <p className="line-clamp-1 text-xs font-semibold text-white">{item.nombre}</p>
                  {item.precio !== null ? (
                    <p className="text-sm font-black text-white">S/ {item.precio.toFixed(2)}</p>
                  ) : (
                    <p className="text-[11px] font-bold uppercase text-yellow-300">Precio especial</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryShowcaseSection({
  panels,
}: {
  panels: Array<{ name: string; items: ProductProps[] }>;
}) {
  if (panels.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">Explora por categoría</h2>
      <div className={`grid gap-4 ${panels.length > 1 ? "md:grid-cols-2" : ""}`}>
        {panels.map((panel) => (
          <div key={panel.name} className="rounded-xl border border-gray-200 p-5">
            <div className="mb-4 flex flex-col items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{panel.name}</h3>
              <Link
                href={`/productos?categoria=${encodeURIComponent(panel.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 text-sm font-semibold text-amazon_blue"
              >
                Ver todo en {panel.name}
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {panel.items.map((product) => (
                <Link
                  key={`${panel.name}-${product._id}`}
                  href={`/${product.slug || product.code || product._id}`}
                  className="min-w-0"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image src={product.image || "/favicon-96x96.png"} alt={product.title || "Producto"} fill className="object-cover" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-700">{product.title || "Producto"}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold text-amazon_blue">S/ {Number(product.price || 0).toFixed(2)}</span>
                    {typeof product.oldPrice === "number" && product.oldPrice > product.price ? (
                      <span className="text-xs text-gray-400 line-through">S/ {Number(product.oldPrice).toFixed(2)}</span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type MobilePromoSlide = {
  href: string;
  title: string;
  text: string;
  icon: ElementType;
  endIcon: ElementType;
};

function MobilePromoSlider({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: MobilePromoSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const current = slides[activeIndex] || slides[0];
  const Icon = current.icon;
  const EndIcon = current.endIcon;

  return (
    <div className="mx-4 mt-2">
      <Link
        href={current.href}
        className="rr-shine flex h-11 items-center gap-3 overflow-hidden rounded-md bg-amazon_blue px-3 text-white"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
          <Icon className="rr-icon-pop h-5 w-5" />
        </span>
        <span key={current.href} className="min-w-0 flex-1 truncate text-sm font-bold animate-[rrFadeIn_.28s_ease-out]">
          {current.title}
          <span className="ml-2 font-semibold text-white/90">{current.text}</span>
        </span>
        <EndIcon className="h-6 w-6 shrink-0 text-white/85" />
        <QuestionMarkCircleIcon className="h-5 w-5 shrink-0 text-white/75" />
      </Link>
      <div className="mt-1.5 flex justify-center gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.href}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-4 bg-amazon_blue" : "w-1.5 bg-gray-300"}`}
            aria-label={`Ver mensaje ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  const promotionSeed = String(Date.now());
  try {
    const productData = await getAllProducts();
    const [behavior, marketplaceProducts, ofertasExpress] = await Promise.all([
      getPurchaseBehaviorSnapshot(8, 12, 180),
      getPublishedMarketplaceProducts(),
      getActiveOfertasExpress(),
    ]);
    return {
      props: {
        productData,
        behavior,
        marketplaceProducts: JSON.parse(JSON.stringify(marketplaceProducts)),
        ofertasExpress,
        promotionSeed,
      },
    };
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
        marketplaceProducts: [],
        ofertasExpress: [],
        promotionSeed,
      },
    };
  }
};
