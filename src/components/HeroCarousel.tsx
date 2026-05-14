import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { ProductProps } from "../../type";

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
          tone: "from-[#fff5f9] via-[#ffe6f1] to-[#fff8df]",
        },
        {
          label: "Accesorios para resina",
          title: "Detalles que completan tus creaciones",
          text: "Encuentra dijes, llaveros, lapiceros y complementos para dar acabado a tus piezas.",
          href: "/categoria/accesorios",
          cta: "Ver accesorios",
          image: normalizeImage(accessoryProduct?.image || productGroups.popular[0]?.image || MOLDS_FLYER_IMAGE),
          product: accessoryProduct,
          tone: "from-[#f5f3ff] via-[#fce7f3] to-[#fff8df]",
        },
        {
          label: "Color y resina",
          title: "Materiales para dar vida a tus ideas",
          text: "Explora resinas, pigmentos y colores para lograr acabados brillantes y personalizados.",
          href: "/categoria/pigmentos",
          cta: "Ver pigmentos",
          image: normalizeImage(resinProduct?.image || productGroups.popular[1]?.image || MOLDS_FLYER_IMAGE),
          product: resinProduct,
          tone: "from-[#effcf6] via-[#dff7ed] to-[#fff8df]",
        },
        {
          label: "Ofertas activas",
          title: "Precios especiales para tu próximo pedido",
          text: "Encuentra descuentos en materiales seleccionados y compra con atención rápida.",
          href: "/productos?ofertas=1",
          cta: "Ver ofertas",
          image: normalizeImage(offerProduct?.image || productGroups.popular[2]?.image || MOLDS_FLYER_IMAGE),
          product: offerProduct,
          tone: "from-[#fff7ed] via-[#ffe4c7] to-[#fff8df]",
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

  const goTo = (nextIndex: number) => {
    const total = slides.length;
    setActiveIndex((nextIndex + total) % total);
    setCycleIndex((current) => current + 1);
  };

  return (
    <section className="w-full">
      <div className="grid min-h-[420px] grid-cols-[230px_minmax(0,1fr)_270px] gap-4">
        <aside className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-bold text-gray-900">Categorías</p>
          </div>
          <nav className="grid py-2">
            {categoryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-amazon_blue"
              >
                <span>{item.label}</span>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </nav>
          <div className="mx-3 mb-3 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase text-gray-500">Compra segura</p>
            <p className="mt-1 text-sm font-bold text-gray-900">Te ayudamos a elegir antes de comprar</p>
          </div>
        </aside>

        <div className="min-w-0">
          <div className={`relative h-[420px] overflow-hidden rounded-lg bg-gradient-to-br ${activeSlide.tone}`}>
            <Link href={activeSlide.href} className="absolute inset-0 z-[1]" aria-label={activeSlide.cta} />
            <div className="absolute inset-0 z-[2] grid grid-cols-[minmax(0,0.95fr)_minmax(390px,1.05fr)] items-center gap-8 px-10 py-8">
              <div className="flex h-full max-w-[455px] flex-col justify-between pl-2">
                <div>
                  <span className="text-[12px] font-black uppercase tracking-[0.18em] text-amazon_blue">
                    {activeSlide.label}
                  </span>
                  <h1 className="mt-5 max-w-[430px] text-[38px] font-black leading-[1.08] text-gray-950">
                    {activeSlide.title}
                  </h1>
                  <p className="mt-5 max-w-[395px] text-[17px] leading-7 text-gray-700">
                    {activeSlide.text}
                  </p>
                  <div className="mt-8 flex items-center gap-5">
                    <span className="inline-flex h-12 items-center rounded-full bg-amazon_blue px-6 text-sm font-black text-white shadow-md shadow-pink-500/20">
                      {activeSlide.cta}
                    </span>
                    {activeSlide.product ? (
                      <span className="text-sm font-black text-gray-950">
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

              <div className="relative ml-auto flex h-[340px] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-md bg-white/60 p-4 shadow-xl shadow-gray-900/10 ring-1 ring-white/70">
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

          <div className="mt-4 grid grid-cols-3 gap-4">
            {sideProducts.slice(0, 3).map((product) => (
              <Link
                key={`hero-product-${product._id}`}
                href={productHref(product)}
                className="group flex min-h-[92px] items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-pink-200 hover:shadow-sm"
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
                  <p className="mt-1 text-sm font-black text-amazon_blue">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <Link href="/productos?ofertas=1" className="rounded-lg border border-orange-100 bg-[#fff7ed] p-4 hover:shadow-sm">
            <div className="flex items-center gap-2 text-orange-600">
              <TagIcon className="h-5 w-5" />
              <p className="text-sm font-black">Ofertas Express</p>
            </div>
            <p className="mt-2 text-2xl font-black leading-tight text-gray-950">Promos para hoy</p>
            <p className="mt-1 text-sm text-gray-600">Descuentos en productos seleccionados.</p>
          </Link>

          {quickDeals.length > 0 ? (
            quickDeals.map((deal) => (
              <div key={deal.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="relative h-28 overflow-hidden rounded-md bg-gray-50">
                  <Image src={normalizeImage(deal.imagen)} alt={deal.nombre} fill sizes="240px" className="object-cover" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-gray-900">{deal.nombre}</p>
              </div>
            ))
          ) : (
            <Link href="/categoria/moldes-de-silicona" className="rounded-lg border border-pink-100 bg-pink-50 p-4 hover:shadow-sm">
              <div className="flex items-center gap-2 text-amazon_blue">
                <SparklesIcon className="h-5 w-5" />
                <p className="text-sm font-black">Moldes nuevos</p>
              </div>
              <p className="mt-2 text-xl font-black leading-tight text-gray-950">Encuentra piezas para crear regalos únicos</p>
            </Link>
          )}

          <Link
            href="/proceso-envio"
            className="grid gap-4 rounded-lg border border-pink-100 bg-white p-4 shadow-sm hover:border-pink-200 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-amazon_blue">
                <TruckIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-black leading-tight text-gray-950">Proceso de envío</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Conoce cómo cotizamos y despachamos tu pedido.</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-amazon_blue">
                <ShieldCheckIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-black leading-tight text-gray-950">Pago coordinado y seguro</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Yape y BCP autorizados antes del envío.</p>
              </div>
            </div>
          </Link>
        </aside>
      </div>
    </section>
  );
}
