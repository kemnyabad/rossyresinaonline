import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminNav() {
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? router.pathname === "/admin" : router.pathname.startsWith(href);

  const navClass = (href: string) =>
    `px-3 py-1 rounded border text-sm transition ${
      isActive(href)
        ? "border-slate-900 bg-slate-900 text-white font-semibold"
        : "border-gray-300 text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
      <Link href="/admin" className={navClass("/admin")}>Productos</Link>
      <Link href="/admin/categories" className={navClass("/admin/categories")}>Categorías</Link>
      <Link href="/admin/blog" className={navClass("/admin/blog")}>Blog</Link>
      <Link href="/admin/orders" className={navClass("/admin/orders")}>Pedidos</Link>
      <Link href="/admin/visits" className={navClass("/admin/visits")}>Visitas</Link>
      <Link href="/admin/stats" className={navClass("/admin/stats")}>Estadísticas</Link>
      <Link href="/admin/customers" className={navClass("/admin/customers")}>Clientes</Link>
      <Link href="/admin/users" className={navClass("/admin/users")}>Usuarios</Link>
    </div>
  );
}
