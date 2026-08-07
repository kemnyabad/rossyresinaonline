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
  StarIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { FaClock } from "react-icons/fa";
import {
  getOfferProducts,
} from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getPublishedMarketplaceProducts } from "@/lib/marketplaceDb";
import { getPurchaseBehaviorSnapshot, type PurchaseBehaviorSnapshot } from "@/lib/repositories/categoryInsightsRepository";
import { absoluteImageUrl, absoluteUrl, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { useLiveProducts } from "@/lib/useLiveProducts";

interface Props {
  productData: ProductProps[];
  behavior: PurchaseBehaviorSnapshot;
  marketplaceProducts: any[];
  promotionSeed: string;
}

type ExpressOfferItem = {
  id: string;
  nombre: string;
  imagen: string;
  href?: string;
  badge?: string;
  price?: number;
  oldPrice?: number;
  precio?: number;
  productoId?: string;
  soldCount?: number;
  stock?: number;
};

function promotionKey(item: ProductProps | ExpressOfferItem) {
  if ("nombre" in item) return String(item.id || item.nombre || "");
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

function shufflePromotionItems<T extends ProductProps | ExpressOfferItem>(items: T[], seed: string): T[] {
  return [...items].sort((a, b) => {
    const scoreA = hashPromotionValue(`${seed}:${promotionKey(a)}`);
    const scoreB = hashPromotionValue(`${seed}:${promotionKey(b)}`);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return promotionKey(a).localeCompare(promotionKey(b));
  });
}

function rotatePromotionItems<T extends ProductProps | ExpressOfferItem>(items: T[], seed: string): T[] {
  if (items.length <= 1) return items;
  const offset = hashPromotionValue(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export default function Home({ productData, behavior, marketplaceProducts, promotionSeed }: Props) {
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
              <Link key={`mobile-grid-${p._id}`} href={`/${p.code || p._id}`} className="mb-1.5 inline-block w-full min-w-0 break-inside-avoid bg-white align-top">
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
          <StoreWithAdsLayout className="pb-10 pt-6">
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

        <section className="border-t border-gray-100 bg-white px-4 py-8 md:px-6">
          <div className="mx-auto max-w-screen-2xl">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] md:items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-950 md:text-2xl">
                  Tienda de resina epóxica y moldes de silicona en Perú
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 md:text-base">
                  En Rossy Resina encuentras materiales para manualidades, bisutería y emprendimientos:
                  resina epóxica, resina UV, moldes de silicona, pigmentos, glitters, vasos mezcladores y
                  accesorios para crear piezas listas para vender.
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 md:text-base">
                  Atendemos pedidos con envío a todo Perú y soporte por WhatsApp para elegir productos según
                  tu proyecto, desde llaveros y dijes hasta lapiceros shaker, recuerdos personalizados y piezas
                  decorativas en resina.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-gray-800 sm:grid-cols-3 md:grid-cols-2">
                <Link href="/categoria/resina" className="rounded-md border border-gray-200 px-3 py-3 hover:border-amazon_blue hover:text-amazon_blue">
                  Resina epóxica
                </Link>
                <Link href="/categoria/moldes-de-silicona" className="rounded-md border border-gray-200 px-3 py-3 hover:border-amazon_blue hover:text-amazon_blue">
                  Moldes de silicona
                </Link>
                <Link href="/categoria/pigmentos" className="rounded-md border border-gray-200 px-3 py-3 hover:border-amazon_blue hover:text-amazon_blue">
                  Pigmentos
                </Link>
                <Link href="/productos" className="rounded-md border border-gray-200 px-3 py-3 hover:border-amazon_blue hover:text-amazon_blue">
                  Catálogo completo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

          <>
            <button
              type="button"
              onClick={() => scrollOffers("left")}
              className="absolute left-0 top-[38%] z-10 hidden h-10 w-10 -translate-x-3 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-[0_8px_20px_rgba(17,24,39,0.14)] transition hover:border-amazon_blue hover:text-amazon_blue md:flex"
              aria-label="Deslizar ofertas hacia atrás"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollOffers("right")}
              className="absolute right-0 top-[38%] z-10 hidden h-10 min-w-10 translate-x-3 items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 shadow-[0_8px_20px_rgba(17,24,39,0.14)] transition hover:border-amazon_blue hover:text-amazon_blue md:flex"
              aria-label="Deslizar y ver más ofertas"
            >
              <span>Deslizar</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
        <div
          ref={carouselRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
        >
        {items.map((item) => {
              const price = Number(item.price || 0);
              const oldPrice = Number(item.oldPrice || 0);
              const hasPrice = price > 0;
              const hasDiscount = oldPrice > price && price > 0;
              const discountPercent = hasDiscount ? Math.max(1, Math.round(((oldPrice - price) / oldPrice) * 100)) : 0;
              const [priceWhole, priceCents] = price.toFixed(2).split(".");
              const stock = Number(item.stock || 0);
              const stockLabel = stock > 0 && stock <= 9 ? `Últimas ${stock} a precio promocional` : "Oferta express";
              const cardClass = "group block bg-white text-left text-gray-950 transition-colors hover:text-amazon_blue";
              const content = (
                <>
                  <ExpressOfferImage item={item} stockLabel={stockLabel} />
                  <div className="pt-2">
                    <p className="line-clamp-1 text-sm font-medium leading-5 text-gray-950 group-hover:text-amazon_blue">{item.nombre}</p>
                    {hasPrice ? (
                      <div className="mt-1 flex items-end gap-1 text-gray-950">
                        <span className={`text-sm font-bold leading-none ${titleClass}`}>S/</span>
                        <span className={`text-2xl font-black leading-none tracking-normal ${titleClass}`}>{priceWhole}</span>
                        <span className={`pb-1.5 text-xs font-bold leading-none ${titleClass}`}>{priceCents}</span>
                        {hasDiscount && (
                          <span className="pb-1 text-xs text-gray-500 line-through">S/{oldPrice.toFixed(2)}</span>
                        )}
                      </div>
                    ) : (
                      <div className={`mt-1 text-sm font-black uppercase ${titleClass}`}>{item.badge || "Promo express"}</div>
                    )}
                    {hasDiscount ? (
                      <div className="mt-1 text-sm font-black leading-5 text-red-600">
                        -{discountPercent}% tiempo limitado
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <span className="flex items-center gap-0 text-gray-950">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <StarIcon key={star} className="h-3.5 w-3.5" />
                        ))}
                        </span>
                        <span>{item.soldCount || 46}</span>
                      </div>
                    )}
                  </div>
                </>
              );
              return item.href ? (
                <Link key={item.id} href={item.href} className={`${cardClass} w-[calc((100%_-_0.75rem)/2)] shrink-0 snap-start sm:w-[calc((100%_-_1.5rem)/3)] lg:w-[calc((100%_-_3.75rem)/6)]`} data-express-offer-card="true">
                  {content}
                </Link>
              ) : (
                <div key={item.id} className={`${cardClass} w-[calc((100%_-_0.75rem)/2)] shrink-0 snap-start sm:w-[calc((100%_-_1.5rem)/3)] lg:w-[calc((100%_-_3.75rem)/6)]`} data-express-offer-card="true">
                  {content}
                </div>
              );
            })}
        </div>
        {canSlide && (
          <div className="mt-2 flex justify-center md:hidden">
            <button
              type="button"
              onClick={() => scrollOffers("right")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-amazon_blue bg-white px-5 text-sm font-bold text-amazon_blue"
            >
              Deslizar ofertas
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ExpressOfferImage({ item, stockLabel }: { item: ExpressOfferItem; stockLabel: string }) {
  const [hasDarkLabelArea, setHasDarkLabelArea] = useState(false);

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
      <Image
        src={item.imagen}
        alt={item.nombre}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onLoadingComplete={(img) => setHasDarkLabelArea(detectDarkBottomArea(img))}
      />
      <span className="absolute right-1.5 top-1.5 rounded-sm bg-gray-950/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        Express
      </span>
      <div
        className={
          "absolute inset-x-3 bottom-3 rounded-full px-3 py-2 text-center text-[11px] font-semibold uppercase leading-4 backdrop-blur-sm " +
          (hasDarkLabelArea ? "bg-white/95 text-gray-950" : "bg-gray-950/70 text-white")
        }
      >
        {stockLabel}
      </div>
    </div>
  );
}

function detectDarkBottomArea(img: HTMLImageElement) {
  try {
    if (typeof document === "undefined" || !img.naturalWidth || !img.naturalHeight) return false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;

    const sampleWidth = 32;
    const sampleHeight = 16;
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const sx = Math.floor(img.naturalWidth * 0.12);
    const sy = Math.floor(img.naturalHeight * 0.68);
    const sw = Math.max(1, Math.floor(img.naturalWidth * 0.76));
    const sh = Math.max(1, Math.floor(img.naturalHeight * 0.2));
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleWidth, sampleHeight);

    const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
    let total = 0;
    let dark = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      total += luminance;
      if (luminance < 55) dark += 1;
    }
    const pixels = data.length / 4;
    return total / pixels < 70 && dark / pixels > 0.55;
  } catch {
    return false;
  }
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
    const [behavior, marketplaceProducts] = await Promise.all([
      getPurchaseBehaviorSnapshot(8, 12, 180),
      getPublishedMarketplaceProducts(),
    ]);
    const prisma = (await import("@/lib/prisma")).default as any;
    const ofertasExpress = await prisma.ofertaExpress.findMany({
      where: {},
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      select: { id: true, nombre: true, imagen: true, productoId: true, precio: true, activo: true, orden: true, startDate: true, endDate: true },
    });

    // Filtrar ofertas para que sólo se devuelvan las activas y dentro del periodo configurado
    const now = new Date();
    const ofertasActivas = ofertasExpress.filter((o: any) => {
      if (!o.activo) return false;
      if (o.startDate && new Date(o.startDate) > now) return false;
      if (o.endDate && new Date(o.endDate) < now) return false;
      return true;
    });
    return {
      props: {
        productData,
        behavior,
        ofertasExpress: JSON.parse(JSON.stringify(ofertasActivas)),
        marketplaceProducts: JSON.parse(JSON.stringify(marketplaceProducts)),
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
        ofertasExpress: [],
        marketplaceProducts: [],
        promotionSeed,
      },
    };
  }
};
