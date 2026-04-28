import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  CubeIcon,
  TagIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  BoltIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
}

type AdminUser = {
  email: string;
  role: "ADMIN";
};

const navGroups = [
  {
    label: "General",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon, exact: true },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin", label: "Productos", icon: CubeIcon, exact: true },
      { href: "/admin/categories", label: "Categorías", icon: TagIcon },
      { href: "/admin/ofertas-express", label: "Ofertas Express", icon: BoltIcon },
    ],
  },
  {
    label: "Contenido",
    items: [
      { href: "/admin/capacitaciones", label: "Capacitaciones", icon: AcademicCapIcon },
      { href: "/admin/inscripciones", label: "Inscripciones", icon: UserGroupIcon },
      { href: "/admin/blog", label: "Blog", icon: DocumentTextIcon },
    ],
  },
  {
    label: "Comercio",
    items: [
      { href: "/admin/orders", label: "Pedidos", icon: ShoppingBagIcon },
      { href: "/admin/rifas", label: "Rifas", icon: TicketIcon },
      { href: "/admin/customers", label: "Clientes", icon: UsersIcon },
    ],
  },
  {
    label: "Analítica",
    items: [
      { href: "/admin/stats", label: "Estadísticas", icon: ChartBarIcon },
      { href: "/admin/visits", label: "Visitas", icon: GlobeAltIcon },
      { href: "/admin/users", label: "Usuarios", icon: UserGroupIcon },
    ],
  },
];

const sectionTitleByPath = (pathname: string): { title: string; breadcrumb: string[] } => {
  if (pathname === "/admin/dashboard") return { title: "Dashboard", breadcrumb: ["General", "Dashboard"] };
  if (pathname === "/admin") return { title: "Productos", breadcrumb: ["Catálogo", "Productos"] };
  if (pathname.startsWith("/admin/categories")) return { title: "Categorías", breadcrumb: ["Catálogo", "Categorías"] };
  if (pathname.startsWith("/admin/capacitaciones")) return { title: "Capacitaciones", breadcrumb: ["Contenido", "Capacitaciones"] };
  if (pathname.startsWith("/admin/inscripciones")) return { title: "Inscripciones", breadcrumb: ["Contenido", "Inscripciones"] };
  if (pathname.startsWith("/admin/blog")) return { title: "Blog", breadcrumb: ["Contenido", "Blog"] };
  if (pathname.startsWith("/admin/orders")) return { title: "Pedidos", breadcrumb: ["Comercio", "Pedidos"] };
  if (pathname.startsWith("/admin/customers")) return { title: "Clientes", breadcrumb: ["Comercio", "Clientes"] };
  if (pathname.startsWith("/admin/rifas")) return { title: "Rifas", breadcrumb: ["Comercio", "Rifas"] };
  if (pathname.startsWith("/admin/stats")) return { title: "Estadísticas", breadcrumb: ["Analítica", "Estadísticas"] };
  if (pathname.startsWith("/admin/visits")) return { title: "Visitas", breadcrumb: ["Analítica", "Visitas"] };
  if (pathname.startsWith("/admin/users")) return { title: "Usuarios", breadcrumb: ["Analítica", "Usuarios"] };
  if (pathname.startsWith("/admin/ofertas-express")) return { title: "Ofertas Express", breadcrumb: ["Catálogo", "Ofertas Express"] };
  if (pathname.startsWith("/admin/edit")) return { title: "Editar producto", breadcrumb: ["Catálogo", "Editar producto"] };
  return { title: "Panel", breadcrumb: ["Admin"] };
};

export default function AdminLayout({ children }: Props) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [pendingRifaPayments, setPendingRifaPayments] = useState(0);
  const isAuthRoute = router.pathname === "/admin/sign-in";
  const { title, breadcrumb } = sectionTitleByPath(router.pathname);

  const isLinkActive = (href: string, exact = false) =>
    exact ? router.pathname === href : router.pathname.startsWith(href);

  useEffect(() => {
    if (isAuthRoute) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;
    const checkAdminSession = async () => {
      try {
        const res = await fetch("/api/admin/auth/session", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.user?.role === "ADMIN") {
          setAdminUser(data.user);
          setAuthChecked(true);
          return;
        }
        setAuthChecked(true);
        router.replace(`/admin/sign-in?callbackUrl=${encodeURIComponent(router.asPath || "/admin")}`);
      } catch {
        if (!cancelled) {
          setAuthChecked(true);
          router.replace(`/admin/sign-in?callbackUrl=${encodeURIComponent(router.asPath || "/admin")}`);
        }
      }
    };

    checkAdminSession();
    return () => {
      cancelled = true;
    };
  }, [isAuthRoute, router]);

  useEffect(() => {
    if (isAuthRoute || !adminUser) return;

    let cancelled = false;
    const fetchPendingRifaPayments = async () => {
      try {
        const res = await fetch("/api/admin/utils?action=pending-count", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) {
          setPendingRifaPayments(Number(data.pendingPayments || 0));
        }
      } catch {
        if (!cancelled) setPendingRifaPayments(0);
      }
    };

    fetchPendingRifaPayments();
    const interval = window.setInterval(fetchPendingRifaPayments, 5000);
    window.addEventListener("focus", fetchPendingRifaPayments);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", fetchPendingRifaPayments);
    };
  }, [adminUser, isAuthRoute]);

  if (isAuthRoute) {
    return <div className="min-h-screen bg-[#0f1117] text-white">{children}</div>;
  }

  if (!authChecked || !adminUser) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {!authChecked ? "Verificando acceso al panel..." : "Redirigiendo al inicio de sesión..."}
          </p>
          <Link href="/admin/sign-in" className="mt-3 inline-flex text-sm font-semibold text-amazon_blue hover:underline">
            Ir al login admin
          </Link>
        </div>
      </div>
    );
  }

  const userName = adminUser.email || "Admin";
  const userInitial = String(userName).slice(0, 1).toUpperCase();
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#1a1d23] flex">

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col" style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)" }}>

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0" style={{ background: "linear-gradient(135deg, #cb299e, #6E2CA1)" }}>
            RR
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white tracking-wide">Rossy Resina</p>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>Panel Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 sidebar-scroll">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon, exact }) => {
                  const active = isLinkActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 relative group"
                      style={active ? {
                        background: "linear-gradient(90deg, rgba(203,41,158,0.25), rgba(110,44,161,0.15))",
                        color: "#fff",
                        fontWeight: 600,
                        boxShadow: "inset 3px 0 0 #cb299e",
                      } : {
                        color: "rgba(255,255,255,0.45)",
                      }}
                      onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; } }}
                      onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; (e.currentTarget as HTMLElement).style.background = ""; } }}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-all duration-200"
                        style={active ? { background: "rgba(203,41,158,0.3)" } : { background: "rgba(255,255,255,0.06)" }}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {href === "/admin/rifas" && pendingRifaPayments > 0 && (
                        <span className="min-w-[1.25rem] rounded-full bg-amber-400 px-1.5 py-0.5 text-center text-[10px] font-black leading-none text-[#311500] shadow-sm">
                          {pendingRifaPayments > 99 ? "99+" : pendingRifaPayments}
                        </span>
                      )}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 pb-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px" }}>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </span>
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
            </span>
            Cerrar sesión
          </button>
        </div>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg, #cb299e, #6E2CA1)" }}>
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Administrador</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-400 shrink-0" title="En línea" />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-2">
                {i > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300" />}
                <span className={i === breadcrumb.length - 1 ? "font-semibold text-gray-900" : ""}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/rifas?tab=tickets"
              className="relative h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              title={
                pendingRifaPayments > 0
                  ? `${pendingRifaPayments} comprobante${pendingRifaPayments === 1 ? "" : "s"} pendiente${pendingRifaPayments === 1 ? "" : "s"}`
                  : "Sin comprobantes pendientes"
              }
            >
              <BellIcon className="w-4 h-4" />
              {pendingRifaPayments > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[1.1rem] rounded-full bg-amber-400 px-1 text-center text-[10px] font-black leading-4 text-[#311500] ring-2 ring-white">
                  {pendingRifaPayments > 99 ? "99+" : pendingRifaPayments}
                </span>
              )}
            </Link>
            <button className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
            <div className="h-9 w-9 rounded-lg bg-amazon_blue flex items-center justify-center text-white text-xs font-bold">
              {userInitial}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
