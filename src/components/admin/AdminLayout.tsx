import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";

interface Props {
  children: ReactNode;
}

const links = [
  { href: "/admin", label: "Productos" },
  { href: "/admin/categories", label: "Categor\u00edas" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/visits", label: "Visitas" },
  { href: "/admin/stats", label: "Estad\u00edsticas" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/users", label: "Usuarios" },
];

const sectionTitleByPath = (pathname: string): string => {
  if (pathname === "/admin") return "Gesti\u00f3n de productos";
  if (pathname.startsWith("/admin/categories")) return "Gesti\u00f3n de categor\u00edas";
  if (pathname.startsWith("/admin/blog")) return "Gesti\u00f3n de blog";
  if (pathname.startsWith("/admin/orders")) return "Gesti\u00f3n de pedidos";
  if (pathname.startsWith("/admin/visits")) return "Visitas de la web";
  if (pathname.startsWith("/admin/stats")) return "Estad\u00edsticas";
  if (pathname.startsWith("/admin/customers")) return "Clientes";
  if (pathname.startsWith("/admin/users")) return "Usuarios";
  return "Gesti\u00f3n de la tienda";
};

export default function AdminLayout({ children }: Props) {
  const router = useRouter();
  const isAuthRoute = router.pathname === "/admin/sign-in";
  const currentTitle = sectionTitleByPath(router.pathname);
  const isLinkActive = (href: string) =>
    href === "/admin" ? router.pathname === "/admin" : router.pathname.startsWith(href);

  if (isAuthRoute) {
    return <div className="min-h-screen bg-slate-100 text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col px-4 py-6">
          <div className="text-lg font-semibold tracking-wide">Panel Admin</div>
          <div className="mt-2 text-xs text-slate-300">Rossy Resina</div>
          <div className="mt-6 flex-1 flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm transition ${
                  isLinkActive(l.href) ? "bg-white/20 text-white font-semibold" : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="grid gap-2">
            <Link href="/" className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">
              Ir a la tienda
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
              className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm text-left"
            >
              Cerrar sesi\u00f3n
            </button>
          </div>
        </aside>
        <main className="ml-64 min-h-screen flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Administraci\u00f3n</p>
              <h1 className="text-lg font-semibold">{currentTitle}</h1>
            </div>
            <div className="text-sm text-slate-500">Acceso restringido</div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
