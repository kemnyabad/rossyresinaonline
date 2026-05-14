import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "./header/Header";
import Footer from "./Footer";
import Link from "next/link";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon, 
  UserIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const isRifasPage = router.pathname.startsWith("/rifas") || router.pathname.startsWith("/admin/rifa");
  const isResinyPage = router.pathname === "/resiny";
  const hideFooter = isRifasPage || router.pathname === "/resiny";
  const [mobilePromoIndex, setMobilePromoIndex] = useState(0);
  const cartCount = useSelector((state: any) =>
    Array.isArray(state?.next?.productData) ? state.next.productData.length : 0
  );

  const mobilePromoSlides = [
    {
      eyebrow: "Especial Mamá",
      title: "¡Sorteo Día de la Madre!",
      icon: "💝",
      decor: "🌸",
      eyebrowClass: "text-pink-100",
    },
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMobilePromoIndex((prev) => (prev + 1) % mobilePromoSlides.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [mobilePromoSlides.length]);

  const mobileTabs = [
    { href: "/", label: "Inicio", icon: HomeIcon, active: router.pathname === "/" },
    { href: "/search", label: "Buscar", icon: MagnifyingGlassIcon, active: router.pathname.startsWith("/search") },
    { href: "/cart", label: "Carrito", icon: ShoppingCartIcon, active: router.pathname.startsWith("/cart") },
    {
      href: "/account",
      label: "Cuenta",
      icon: UserIcon,
      active: router.pathname.startsWith("/account") || router.pathname.startsWith("/sign-in"),
    },
  ];

  return (
    <>
      {!isRifasPage && (
        isResinyPage ? (
          <div className="resiny-fixed-header fixed left-0 right-0 top-0 z-[9998] bg-white">
            <style jsx global>{`
              .resiny-fixed-header > div {
                position: static !important;
                border-bottom: 1px solid #e5e7eb !important;
                box-shadow: none !important;
              }
            `}</style>
            <Header />
          </div>
        ) : (
          <Header />
        )
      )}

      {/* Banner Móvil Temático: sorteos activos (Solo visible en móviles y fuera de rifas) */}
      {!isRifasPage && !isResinyPage && (
        <div className="md:hidden">
          <Link href="/rifas">
            <div className="relative overflow-hidden border-b border-amazon_light/20 bg-amazon_blue px-4 py-3 shadow-sm">
              {/* Elemento decorativo de fondo */}
              <div className="pointer-events-none absolute -right-2 -top-1 opacity-20">
                <span className="text-5xl">{mobilePromoSlides[mobilePromoIndex].decor}</span>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl shadow-inner">
                    {mobilePromoSlides[mobilePromoIndex].icon}
                  </div>
                  <div className="min-w-0 text-white">
                    <p className={`mb-1 truncate text-[9px] font-semibold uppercase leading-none tracking-wide ${mobilePromoSlides[mobilePromoIndex].eyebrowClass}`}>
                      {mobilePromoSlides[mobilePromoIndex].eyebrow}
                    </p>
                    <p className="truncate text-sm font-semibold uppercase leading-tight">
                      {mobilePromoSlides[mobilePromoIndex].title}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex gap-1">
                    {mobilePromoSlides.map((slide, index) => (
                      <span
                        key={slide.eyebrow}
                        className={`h-1.5 rounded-full transition-all ${
                          index === mobilePromoIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/35 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-amazon_blue shadow-sm">
                    Participar <ArrowRightIcon className="h-3 w-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className={`pb-20 md:pb-0 ${isResinyPage ? "bg-white pt-[104px] md:pt-[76px]" : ""}`}>{children}</div>
      <div>
        {!hideFooter && <Footer />} {/* Renderiza Footer solo en páginas públicas de tienda */}
      </div>
      {!isResinyPage && <nav className="fixed bottom-0 left-0 right-0 z-[75] border-t border-gray-200 bg-white md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[11px] ${
                  tab.active ? "font-semibold text-amazon_blue" : "text-gray-500"
                }`}
              >
                <span className="relative">
                  <Icon className={`h-5 w-5 ${tab.active ? "text-amazon_blue" : "text-gray-500"}`} />
                  {tab.href === "/cart" && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amazon_blue px-1 text-[9px] font-semibold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>}
    </>
  );
};

export default RootLayout;
