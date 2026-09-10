import Link from "next/link";
import { ReactNode } from "react";
import {
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  CubeIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

type SellerLayoutProps = {
  children: ReactNode;
  shop?: {
    slug?: string;
    commercialName?: string;
    logoUrl?: string;
    city?: string;
  };
};

const navItems = [
  { href: "#resumen", label: "Resumen", icon: HomeIcon },
  { href: "#perfil", label: "Perfil de tienda", icon: UserCircleIcon },
  { href: "#producto", label: "Crear producto", icon: CubeIcon },
  { href: "#productos", label: "Mis productos", icon: ShoppingBagIcon },
  { href: "#estadisticas", label: "Estadisticas", icon: ChartBarIcon },
];

export default function SellerLayout({ children, shop }: SellerLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 text-white lg:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {shop?.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.commercialName || "Tienda"} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBagIcon className="h-6 w-6 text-[#e4147f]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{shop?.commercialName || "Mi tienda"}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Mi tienda</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            <div>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Gestion</p>
              <div className="space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <a key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          <div className="border-t border-white/10 p-3">
            {shop?.slug && (
              <Link href={`/tienda/${shop.slug}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </span>
                Ver tienda publica
              </Link>
            )}
            <Link href="/account" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/45 transition hover:bg-white/10 hover:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <UserCircleIcon className="h-4 w-4" />
              </span>
              Mi cuenta
            </Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950 sm:text-2xl">Mi tienda</h1>
                <p className="mt-1 text-sm font-medium text-slate-600">Gestiona los productos que apareceran dentro de tu tienda.</p>
              </div>
              {shop?.slug && (
                <Link href={`/tienda/${shop.slug}`} className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-pink-200 bg-white px-3 text-sm font-bold text-slate-900">
                  Ver tienda
                </Link>
              )}
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
