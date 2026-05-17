import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const BottomHeader = () => {
  const router = useRouter();
  const promoMessages = [
    "Envío rápido a todo Perú",
    "Stock limitado en productos top",
    "Compra segura y atención por WhatsApp",
  ];
  const [promoIndex, setPromoIndex] = useState(0);
  const isCurrentPath = (href: string) => {
    const current = (router.asPath || "").split("?")[0].replace(/\/+$/, "") || "/";
    const target = href.split("?")[0].replace(/\/+$/, "") || "/";
    return current === target;
  };
  const categories = [
    { href: "/categoria/moldes-de-silicona", label: "Moldes" },
    { href: "/categoria/pigmentos", label: "Pigmentos" },
    { href: "/categoria/accesorios", label: "Accesorios" },
    { href: "/categoria/resina", label: "Resina" },
    { href: "/categoria/creaciones", label: "Creaciones" },
    { href: "/escuela", label: "Escuela" },
  ];
  const mainNav = [
    { href: "/", label: "Inicio" },
    { href: "/rifas", label: "Rifas" },
    { href: "/blog", label: "Blog" },
  ];
  const menuItems = [mainNav[0], ...categories, ...mainNav.slice(1)];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [promoMessages.length]);

  return (
    <div className="w-full min-h-12 border-t border-gray-200 bg-white text-sm text-gray-700">
      <div className="hidden lg:grid lg:grid-cols-[1fr_320px] items-center relative max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 py-2 gap-4">
        <nav className="no-scrollbar flex h-10 items-center justify-center gap-5 overflow-x-auto whitespace-nowrap">
          {menuItems.map((item) => {
            const active = isCurrentPath(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-8 items-center justify-center rounded-full px-1 text-[15px] font-medium tracking-normal transition-colors duration-200 ${
                  active ? "text-[#c21885]" : "text-slate-700 hover:text-[#c21885]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end" aria-label="Anuncio de descuento">
          <div className="inline-flex h-10 max-w-full cursor-default select-none items-center gap-2 overflow-hidden whitespace-nowrap px-1 text-[#c21885]">
            <span className="inline-flex animate-pulse items-center justify-center text-[22px] leading-none font-semibold tracking-normal shrink-0">
              10%
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-semibold text-[14px]">Descuento en tu primera compra</span>
              <span key={promoIndex} className="block truncate animate-[promoFade_3.2s_ease-in-out] text-[11px] text-[#a31370]">
                {promoMessages[promoIndex]}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="lg:hidden px-3 py-2">
        <div className="no-scrollbar flex w-full snap-x snap-proximity gap-4 overflow-x-auto pl-1 pr-8 touch-pan-x">
          {menuItems.map((item) => {
            const active = isCurrentPath(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 snap-start border-b-2 pb-2 text-[15px] font-medium leading-tight tracking-normal whitespace-nowrap transition-colors duration-200 ${
                  active ? "border-[#c21885] text-[#c21885]" : "border-transparent text-slate-600 hover:text-[#c21885]"
                }`}
                onClick={(e) => {
                  if (active) e.preventDefault();
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
