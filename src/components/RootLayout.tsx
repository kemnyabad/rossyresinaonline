import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "./header/Header";
import BottomHeader from "./header/BottomHeader";
import Footer from "./Footer";
import Link from "next/link";
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  ShoppingCartIcon, 
  UserIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import AssistantRossy from "./AssistantRossy";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const hideBottomHeader = router.pathname === "/cart";
  const isRifasPage = router.pathname.startsWith("/rifas") || router.pathname.startsWith("/admin/rifa");
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [hideAssistant, setHideAssistant] = useState(false);
  const cartCount = useSelector((state: any) =>
    Array.isArray(state?.next?.productData) ? state.next.productData.length : 0
  );

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHideAssistant(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.05 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  const mobileTabs = [
    { href: "/", label: "Inicio", icon: HomeIcon, active: router.pathname === "/" },
    { href: "/search", label: "Buscar", icon: MagnifyingGlassIcon, active: router.pathname.startsWith("/search") },
    { href: "/favorite", label: "Favoritos", icon: HeartIcon, active: router.pathname.startsWith("/favorite") },
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
      {!isRifasPage && <Header />}
      {!hideBottomHeader && !isRifasPage && (
        <div className="hidden md:block">
          <BottomHeader />
        </div>
      )}

      {/* Banner Móvil Temático: Día de la Madre (Solo visible en móviles y fuera de rifas) */}
      {!isRifasPage && (
        <div className="md:hidden">
          <Link href="/rifas">
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 px-4 py-3 flex items-center justify-between shadow-md border-b border-white/10 overflow-hidden relative">
              {/* Elemento decorativo de fondo */}
              <div className="absolute -right-2 -top-1 opacity-20 pointer-events-none">
                <span className="text-5xl">🌸</span>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl animate-pulse">
                  💝
                </div>
                <div className="text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-100 leading-none mb-1">Especial Mamá</p>
                  <p className="text-sm font-black leading-tight">¡SORTEO DÍA DE LA MADRE!</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/40 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm relative z-10">
                PARTICIPAR <ArrowRightIcon className="h-3 w-3 stroke-[3]" />
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="pb-20 md:pb-0">{children}</div>
      <div ref={footerRef}>
        {!isRifasPage && <Footer />} {/* Renderiza Footer solo si NO es la página de rifas */}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-[75] border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
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
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amazon_blue px-1 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {!hideAssistant && <AssistantRossy />}
    </>
  );
};

export default RootLayout;
