import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { ProductProps } from "../../type";
import { ResinyInvite } from "./AssistantRossy";

interface Props {
  productData?: ProductProps[];
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
  ofertasExpress?: { id: string; nombre: string; imagen: string }[];
}

const MOLDS_FLYER_IMAGE = "/banners/moldes-buen-precio.png";

const categoryLinks = [
  { href: "/categoria/moldes-de-silicona", label: "Moldes de silicona" },
  { href: "/categoria/resina", label: "Resinas" },
  { href: "/categoria/pigmentos", label: "Pigmentos" },
  { href: "/categoria/accesorios", label: "Accesorios" },
  { href: "/productos?ofertas=1", label: "Ofertas" },
  { href: "/escuela", label: "Escuela" },
];

const normalizeImage = (src?: string) => {
  const value = String(src || "").trim().replace(/\\/g, "/");
  if (!value) return "/favicon-96x96.png";
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
};

const productHref = (product?: ProductProps) => `/${product?.code || product?._id || "productos"}`;

const formatPrice = (price?: number) => `S/ ${Number(price || 0).toFixed(2)}`;

const normalizeText = (value: any) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const productSearchText = (product: ProductProps) =>
  normalizeText(`${product.title || ""} ${product.category || ""} ${product.brand || ""} ${product.code || ""}`);

const uniqueProducts = (products: ProductProps[]) => {
  const seen = new Set<string>();
  return products.filter((product) => {
    const key = String(product._id || product.code || product.title || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const pickRotatingProduct = (products: ProductProps[], index: number) => {
  if (products.length === 0) return undefined;
  return products[Math.abs(index) % products.length];
};

export default function HeroCarousel({
  productData = [],
  remateProducts = [],
  topVisitedProducts = [],
  moldProducts = [],
  ofertasExpress = [],
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);

  const productGroups = useMemo(() => {
    const isMold = (product: ProductProps) => /molde|silicona|dije|llavero|lapicero/.test(productSearchText(product));
    const isAccessory = (product: ProductProps) =>
      /accesorio|dije|arete|pendiente|pulsera|collar|llavero|lapicero|gancho|anillo|rosario|porta vela|marcapagina/.test(
        productSearchText(product)
      );
    const isResinOrPigment = (product: ProductProps) =>
      /resina|epoxi|epoxica|uv|pigmento|tinte|colorante|mica|ecoresina/.test(productSearchText(product));
    const hasDiscount = (product: ProductProps) => Number(product.oldPrice || 0) > Number(product.price || 0);

    return {
      molds: uniqueProducts([...moldProducts, ...productData.filter(isMold)]),
      accessories: uniqueProducts(productData.filter(isAccessory)),
      resinAndPigments: uniqueProducts(productData.filter(isResinOrPigment)),
      offers: uniqueProducts([...remateProducts, ...productData.filter(hasDiscount)]),
      popular: uniqueProducts([...topVisitedProducts, ...productData]),
    };
  }, [moldProducts, productData, remateProducts, topVisitedProducts]);

  const sideProducts = useMemo(
    () =>
      uniqueProducts([
        ...productGroups.offers,
        ...productGroups.molds,
        ...productGroups.accessories,
        ...productGroups.resinAndPigments,
        ...productGroups.popular,
      ]).slice(cycleIndex % 3, cycleIndex % 3 + 6),
    [cycleIndex, productGroups]
  );

  const slides = useMemo(
    () => {
      const moldProduct = pickRotatingProduct(productGroups.molds, cycleIndex);
      const accessoryProduct = pickRotatingProduct(productGroups.accessories, cycleIndex + 1);
      const resinProduct = pickRotatingProduct(productGroups.resinAndPigments, cycleIndex + 2);
      const offerProduct = pickRotatingProduct(productGroups.offers, cycleIndex + 3);

      return [
        {
          label: "Moldes seleccionados",
          title: "Moldes para crear detalles únicos",
          text: "Elige moldes de silicona para personalizar tus proyectos en resina con formas especiales.",
          href: "/categoria/moldes-de-silicona",
          cta: "Ver moldes",
          image: normalizeImage(moldProduct?.image || MOLDS_FLYER_IMAGE),
          product: moldProduct,
          tone: "bg-white",
        },
        {
          label: "Accesorios para resina",
          title: "Detalles que completan tus creaciones",
          text: "Encuentra dijes, llaveros, lapiceros y complementos para dar acabado a tus piezas.",
          href: "/categoria/accesorios",
          cta: "Ver accesorios",
          image: normalizeImage(accessoryProduct?.image || productGroups.popular[0]?.image || MOLDS_FLYER_IMAGE),
          product: accessoryProduct,
          tone: "bg-[#FAFAFA]",
        },
        {
          label: "Color y resina",
          title: "Materiales para dar vida a tus ideas",
          text: "Explora resinas, pigmentos y colores para lograr acabados brillantes y personalizados.",
          href: "/categoria/pigmentos",
          cta: "Ver pigmentos",
          image: normalizeImage(resinProduct?.image || productGroups.popular[1]?.image || MOLDS_FLYER_IMAGE),
          product: resinProduct,
          tone: "bg-[#F8FAFC]",
        },
        {
          label: "Ofertas activas",
          title: "Precios especiales para tu próximo pedido",
          text: "Encuentra descuentos en materiales seleccionados y compra con atención rápida.",
          href: "/productos?ofertas=1",
          cta: "Ver ofertas",
          image: normalizeImage(offerProduct?.image || productGroups.popular[2]?.image || MOLDS_FLYER_IMAGE),
          product: offerProduct,
          tone: "bg-white",
        },
      ];
    },
    [cycleIndex, productGroups]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
      setCycleIndex((current) => current + 1);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] || slides[0];
  const quickDeals = ofertasExpress.slice(0, 2);
  const promoProducts = useMemo(
    () =>
      uniqueProducts([
        ...productGroups.offers,
        ...productGroups.molds,
        ...productGroups.resinAndPigments,
        ...productGroups.accessories,
        ...productGroups.popular,
      ]).slice(0, 4),
    [productGroups]
  );
  const promoVisualPool = [
    ...quickDeals.map((deal) => ({
      id: deal.id,
      title: deal.nombre,
      image: deal.imagen,
    })),
    ...promoProducts.map((product) => ({
      id: String(product._id || product.code || product.title),
      title: product.title,
      image: product.image,
    })),
  ];
  const promoVisualItems =
    promoVisualPool.length > 0
      ? Array.from({ length: Math.min(2, promoVisualPool.length) }, (_, index) => promoVisualPool[(cycleIndex + index) % promoVisualPool.length])
      : [];

  const goTo = (nextIndex: number) => {
    const total = slides.length;
    setActiveIndex((nextIndex + total) % total);
    setCycleIndex((current) => current + 1);
  };

  return (
    <section className="w-full">
      <div className="grid min-h-[420px] grid-cols-[230px_minmax(0,1fr)_320px] gap-4">
        <div className="self-start">
          <aside className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Categorías</p>
            </div>
            <nav className="grid py-2">
              {categoryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-amazon_blue"
                >
                  <span>{item.label}</span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </nav>
          </aside>
          <div className="mt-3">
            <ResinyInvite />
          </div>
        </div>

        <div className="min-w-0">
          <div className={`relative h-[420px] overflow-hidden rounded-lg border border-gray-200 ${activeSlide.tone} shadow-[0_1px_3px_rgba(17,24,39,0.08)]`}>
            <Link href={activeSlide.href} className="absolute inset-0 z-[1]" aria-label={activeSlide.cta} />
            <div className="absolute inset-0 z-[2] grid grid-cols-[minmax(0,0.95fr)_minmax(390px,1.05fr)] items-center gap-8 px-10 py-8">
              <div className="flex h-full max-w-[455px] flex-col justify-between pl-2">
                <div>
                  <span className="rr-type-label text-amazon_blue">
                    {activeSlide.label}
                  </span>
                  <h1 className="rr-type-display mt-5 max-w-[430px] text-[38px]">
                    {activeSlide.title}
                  </h1>
                  <p className="rr-type-body mt-5 max-w-[395px] text-[17px]">
                    {activeSlide.text}
                  </p>
                  <div className="mt-8 flex items-center gap-5">
                    <span className="inline-flex h-12 items-center rounded-lg bg-amazon_blue px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(203,41,158,0.22)]">
                      {activeSlide.cta}
                    </span>
                    {activeSlide.product ? (
                      <span className="text-sm font-semibold text-gray-950">
                        Desde {formatPrice(activeSlide.product.price)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.label}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        activeIndex === index ? "w-10 bg-amazon_blue" : "w-2.5 bg-white/90"
                      }`}
                      aria-label={`Ir a ${slide.label}`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative ml-auto flex h-[340px] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.08)]">
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.product?.title || activeSlide.title}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1280px) 38vw, 520px"
                  className="object-contain p-3"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute bottom-5 right-[68px] z-[3] flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
              aria-label="Slide anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute bottom-5 right-5 z-[3] flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
              aria-label="Slide siguiente"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4">
            {sideProducts.slice(0, 4).map((product) => (
              <Link
                key={`hero-product-${product._id}`}
                href={productHref(product)}
                className="group flex min-h-[92px] items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amazon_blue/45 hover:shadow-[0_8px_18px_rgba(17,24,39,0.10)]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-50">
                  <Image
                    src={normalizeImage(product.image)}
                    alt={product.title || "Producto"}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">{product.title}</p>
                  <p className="mt-1 text-sm font-semibold text-amazon_blue">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <Link
            href="/productos?ofertas=1"
            className="group relative overflow-visible rounded-lg border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amazon_blue/45 hover:shadow-[0_10px_24px_rgba(17,24,39,0.10)]"
          >
            <div className="absolute -top-4 right-4 z-[3] rounded-md bg-amazon_blue px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(203,41,158,0.22)]">
              Hasta 30% OFF
            </div>

            <div className="relative h-40 overflow-visible">
              {promoVisualItems.length > 0 ? (
                <>
                  <div className="absolute bottom-0 left-0 top-0 w-[46%] transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Image
                      src={normalizeImage(promoVisualItems[0]?.image || MOLDS_FLYER_IMAGE)}
                      alt={promoVisualItems[0]?.title || "Producto en promoción"}
                      fill
                      sizes="190px"
                      className="object-contain mix-blend-multiply drop-shadow-[0_12px_18px_rgba(17,24,39,0.18)]"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 top-2 w-[46%] transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Image
                      src={normalizeImage(promoVisualItems[1]?.image || promoVisualItems[0]?.image || MOLDS_FLYER_IMAGE)}
                      alt={promoVisualItems[1]?.title || "Oferta Rossy Resina"}
                      fill
                      sizes="190px"
                      className="object-contain mix-blend-multiply drop-shadow-[0_12px_18px_rgba(17,24,39,0.18)]"
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-2 text-center">
              <div className="mx-auto inline-flex items-center gap-2 text-amazon_blue transition-transform duration-200 group-hover:-translate-y-0.5">
                <TagIcon className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Ofertas resineras</p>
              </div>
              <h3 className="rr-type-title mx-auto mt-2 max-w-none whitespace-nowrap text-[25px] transition-colors duration-200 group-hover:text-amazon_blue">
                Promos de la semana
              </h3>
              <p className="rr-type-label mt-2 max-w-none whitespace-nowrap text-left text-[10px] text-amazon_blue/80">
                Insumos para emprender con resina
              </p>
              <span className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-amazon_blue px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(203,41,158,0.22)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-amazon_light group-hover:shadow-[0_14px_28px_rgba(203,41,158,0.24)]">
                Ver promociones
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {quickDeals.length > 0
            ? quickDeals.map((deal) => (
                <div key={deal.id} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="relative h-28 overflow-hidden rounded-md bg-gray-50">
                    <Image src={normalizeImage(deal.imagen)} alt={deal.nombre} fill sizes="240px" className="object-cover" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">{deal.nombre}</p>
                </div>
              ))
            : null}

          <Link
            href="/proceso-envio"
            className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amazon_blue/45 hover:shadow-[0_8px_18px_rgba(17,24,39,0.10)]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-amazon_blue">
                <TruckIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-semibold leading-tight text-gray-950">Proceso de envío</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Conoce cómo cotizamos y despachamos tu pedido.</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-amazon_blue">
                <ShieldCheckIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-semibold leading-tight text-gray-950">Pago coordinado y seguro</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Yape y BCP autorizados antes del envío.</p>
              </div>
            </div>
          </Link>
        </aside>
      </div>
    </section>
  );
}
