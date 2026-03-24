import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "./header/Header";
import BottomHeader from "./header/BottomHeader";
import Footer from "./Footer";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { HiOutlineHeart, HiOutlineHome, HiOutlineSearch, HiOutlineShoppingCart, HiOutlineUser } from "react-icons/hi";
import { useSelector } from "react-redux";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const hideBottomHeader = router.pathname === "/cart";
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [hideWhatsapp, setHideWhatsapp] = useState(false);
  const cartCount = useSelector((state: any) =>
    Array.isArray(state?.next?.productData) ? state.next.productData.length : 0
  );
  const waPhoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || "51966357648";
  const waPhone = waPhoneRaw.replace(/\D/g, "");
  const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    "Hola, quiero informacion sobre sus productos."
  )}`;

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHideWhatsapp(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.05 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  const mobileTabs = [
    { href: "/", label: "Inicio", icon: HiOutlineHome, active: router.pathname === "/" },
    { href: "/search", label: "Buscar", icon: HiOutlineSearch, active: router.pathname.startsWith("/search") },
    { href: "/favorite", label: "Favoritos", icon: HiOutlineHeart, active: router.pathname.startsWith("/favorite") },
    { href: "/cart", label: "Carrito", icon: HiOutlineShoppingCart, active: router.pathname.startsWith("/cart") },
    {
      href: "/account",
      label: "Cuenta",
      icon: HiOutlineUser,
      active: router.pathname.startsWith("/account") || router.pathname.startsWith("/sign-in"),
    },
  ];

  return (
    <>
      <Header />
      {!hideBottomHeader && (
        <div className="hidden md:block">
          <BottomHeader />
        </div>
      )}
      <div className="pb-20 md:pb-0">{children}</div>
      <div ref={footerRef}>
        <Footer />
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
      {!hideWhatsapp && (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="fixed bottom-24 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 md:bottom-4"
        >
          <FaWhatsapp className="h-6 w-6" />
        </a>
      )}
    </>
  );
};

export default RootLayout;
