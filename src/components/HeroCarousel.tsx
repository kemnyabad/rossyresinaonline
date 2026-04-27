import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductProps } from "../../type";

interface Props {
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
  ofertasExpress?: { id: string; nombre: string; imagen: string }[];
}

export default function HeroCarousel({ remateProducts = [], topVisitedProducts = [], moldProducts = [], ofertasExpress = [] }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [currentProducts, setCurrentProducts] = useState<{
    remate: { label: string; image: string | undefined; title: string | undefined }[];
    topVisited: { label: string; image: string | undefined; title: string | undefined }[];
    mold: { label: string; image: string | undefined; title: string | undefined }[];
  }>({ remate: [], topVisited: [], mold: [] });

  const totalSlides = ofertasExpress.length > 0 ? 4 : 3;

  useEffect(() => {
    const target = new Date("2026-04-06T00:00:00-05:00").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown("¡Oferta terminada!"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlay, totalSlides]);

  const getRandomProducts = (products: ProductProps[], count: number) => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, products.length));
  };

  useEffect(() => {
    const all = [...remateProducts, ...topVisitedProducts, ...moldProducts];
    const resinaProducts = all.filter(p => `${p.title || ""} ${p.category || ""}`.toLowerCase().match(/resina|epoxi|epóxica/));
    const moldeProducts = all.filter(p => `${p.title || ""} ${p.category || ""}`.toLowerCase().match(/molde|silicona/));
    const pigmentProducts = all.filter(p => `${p.title || ""} ${p.category || ""}`.toLowerCase().match(/pigmento|color|mica|tinta/));
    setCurrentProducts({
      remate: getRandomProducts(resinaProducts, 4).map(p => ({ label: `S/${Number(p.price || 0).toFixed(2)}`, image: p.image, title: p.title })),
      topVisited: getRandomProducts(moldeProducts, 4).map(p => ({ label: `S/${Number(p.price || 0).toFixed(2)}`, image: p.image, title: p.title })),
      mold: getRandomProducts(pigmentProducts, 4).map(p => ({ label: `S/${Number(p.price || 0).toFixed(2)}`, image: p.image, title: p.title })),
    });
    const interval = setInterval(() => {
      setCurrentProducts({
        remate: getRandomProducts(resinaProducts, 4).map(p => ({ label: `S/${Number(p.price || 0).toFixed(2)}`, image: p.image, title: p.title })),
        topVisited: getRandomProducts(moldeProducts, 4).map(p => ({ label: `S/${Number(p.price || 0).toFixed(2)}`, image: p.image, title: p.title })),
        mold: getRandomProducts(pigmentProducts, 4).map(p => ({ label: `S/${Number(p.price || 0).toFixed(2)}`, image: p.image, title: p.title })),
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [remateProducts, topVisitedProducts, moldProducts]);

  const regularSlides = [
    { id: 0, bg: "from-[#1a5f3f] via-[#2d7a5a] to-[#40a373]", heading: "Resina Epóxica Profesional", subheading: "Calidad superior para tus proyectos creativos", button: "Explorar productos", href: "/productos", items: currentProducts.remate },
    { id: 1, bg: "from-[#8b5cf6] via-[#a78bfa] to-[#c4b5fd]", heading: "Moldes de Silicona Premium", subheading: "Diseños exclusivos para bisutería y decoración", button: "Ver colección", href: "/productos", items: currentProducts.topVisited },
    { id: 2, bg: "from-[#0f766e] via-[#14b8a6] to-[#5eead4]", heading: "Pigmentos y Efectos Especiales", subheading: "Dale vida y color a tus creaciones", button: "Descubrir colores", href: "/productos", items: currentProducts.mold },
  ];

  const isExpressSlide = ofertasExpress.length > 0 && slideIndex === 3;
  const activeSlide = isExpressSlide ? null : regularSlides[slideIndex];

  const cardVisibility = (idx: number) => (idx >= 3 ? "hidden 2xl:block" : "");

  const renderProductCard = (item: any, idx: number) => (
    <div key={idx} className={`group relative w-[108px] shrink-0 lg:w-[122px] xl:w-[138px] 2xl:w-[150px] ${cardVisibility(idx)}`}>
      <div className="relative rounded-2xl border border-white/30 bg-white/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03]">
        <div className="relative h-[86px] overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 lg:h-[100px] xl:h-[112px] 2xl:h-[126px]">
          <img src={item.image} alt={item.title || item.label} className="h-full w-full object-contain p-1 transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="mt-2 min-h-[42px] text-center">
          <p className="text-sm font-black text-gray-900 xl:text-base">{item.label}</p>
          {item.title && <p className="mt-0.5 truncate text-xs text-gray-600">{item.title}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden">
      <div className={`relative h-[260px] md:h-[320px] w-full overflow-hidden bg-gradient-to-br ${isExpressSlide ? "from-[#7c2d12] via-[#c2410c] to-[#f97316]" : activeSlide!.bg}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

        <div className="relative mx-auto flex h-full max-w-screen-2xl items-center px-6 md:px-8">
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 items-center">

            {isExpressSlide ? (
              <>
                <div className="col-span-12 md:col-span-5 text-center md:text-left pl-10 md:pl-12 space-y-2">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <p className="text-sm font-bold text-white/90 uppercase tracking-wider">Ofertas Limitadas</p>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">¡Aprovecha las Ofertas Express!</h2>
                  <p className="text-white/90 font-semibold text-sm">🔥 Solo hasta el domingo 5 de abril</p>
                  {countdown && (
                    <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                      <span className="text-white/80 text-xs font-medium">Termina en:</span>
                      <span className="text-white text-xl font-black font-mono animate-pulse">{countdown}</span>
                    </div>
                  )}
                  <div className="pt-1">
                    <Link href="/productos?ofertas-express=1" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-600 hover:scale-105 hover:shadow-2xl shadow-xl transition-all duration-300">
                      Ver ofertas express →
                    </Link>
                  </div>
                </div>
                <div className="col-span-12 flex items-center justify-center overflow-hidden md:col-span-7">
                  <div className="flex max-w-full flex-nowrap justify-center gap-3 lg:gap-4">
                    {ofertasExpress.slice(0, 4).map((item, idx) => (
                      <div key={idx} className={`group relative w-[108px] shrink-0 lg:w-[122px] xl:w-[138px] 2xl:w-[150px] ${cardVisibility(idx)}`}>
                        <div className="relative rounded-2xl border border-white/30 bg-white/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03]">
                          <div className="relative h-[86px] overflow-hidden rounded-xl bg-gray-50 lg:h-[100px] xl:h-[112px] 2xl:h-[126px]">
                            <img src={item.imagen} alt={item.nombre} className="h-full w-full object-contain p-1 transition-transform duration-700 group-hover:scale-105" />
                            <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">EXPRESS</span>
                          </div>
                          <p className="mt-2 min-h-[32px] text-center text-xs font-semibold leading-4 text-gray-800 line-clamp-2">{item.nombre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-12 md:col-span-5 text-center md:text-left pl-10 md:pl-12">
                  <div className="space-y-1 md:space-y-2">
                    <div className="inline-flex items-center">
                      <div className="h-px w-8 bg-white/40 mr-3" />
                      <p className="text-sm md:text-base font-medium text-white/95 tracking-wider uppercase">{activeSlide!.subheading}</p>
                      <div className="h-px w-8 bg-white/40 ml-3" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">{activeSlide!.heading}</h2>
                    <div className="pt-2">
                      <Link href={activeSlide!.href} className="group inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm md:text-base font-bold text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" onMouseEnter={() => setIsAutoPlay(false)} onMouseLeave={() => setIsAutoPlay(true)}>
                        {activeSlide!.button}
                        <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 flex items-center justify-center overflow-hidden md:col-span-7">
                  <div className="flex max-w-full flex-nowrap justify-center gap-3 lg:gap-4">
                    {activeSlide!.items.length === 0 ? (
                      null
                    ) : (
                      activeSlide!.items.map((item, idx) => renderProductCard(item, idx))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button key={i} onClick={() => { setSlideIndex(i); setIsAutoPlay(false); setTimeout(() => setIsAutoPlay(true), 6000); }}
              className={`h-3 w-12 rounded-full transition-all duration-300 ${slideIndex === i ? "bg-white shadow-xl scale-110" : "bg-white/40 hover:bg-white/60"}`}
              aria-label={`Ir al banner ${i + 1}`}
            />
          ))}
        </div>

        <button onClick={() => { setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides); setIsAutoPlay(false); setTimeout(() => setIsAutoPlay(true), 6000); }}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/10 backdrop-blur-md p-3 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
          aria-label="Anterior banner">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => { setSlideIndex((prev) => (prev + 1) % totalSlides); setIsAutoPlay(false); setTimeout(() => setIsAutoPlay(true), 6000); }}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/10 backdrop-blur-md p-3 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
          aria-label="Siguiente banner">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}
