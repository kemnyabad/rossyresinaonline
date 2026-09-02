import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon, StarIcon } from "@heroicons/react/24/outline";

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  image?: string;
  code?: string;
  productId?: string;
  _id?: string | number;
};

type Order = {
  id: string;
  items: OrderItem[];
};

const normalizeImage = (src?: string) => {
  const raw = String(src || "").replace(/\\/g, "/");
  if (!raw) return "/favicon-96x96.png";
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
};

const productHref = (item: OrderItem) => {
  const id = item.code || item.productId || item._id;
  return id ? `/${id}` : "/productos";
};

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isAdminSession = (session?.user as any)?.role === "ADMIN";
  const customerSession = !isAdminSession ? session : null;

  useEffect(() => {
    const email = String((customerSession?.user as any)?.email || "").trim();
    if (!email) return;
    setLoading(true);
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [customerSession?.user]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => {
        if (!alive) return;
        setProducts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const purchasedItems = useMemo(() => {
    const map = new Map<string, OrderItem>();
    const byId = new Map(products.map((product) => [String(product._id || product.id || ""), product]));
    const byCode = new Map(products.filter((product) => product.code).map((product) => [String(product.code), product]));
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = String(item.code || item.productId || item._id || item.title || "");
        if (!key || map.has(key)) return;
        const product = byCode.get(String(item.code || "")) || byId.get(String(item.productId || item._id || ""));
        map.set(key, {
          ...item,
          code: product?.code || item.code,
          productId: product?._id || product?.id || item.productId,
          image: product?.image || item.image,
          title: product?.title || item.title,
        });
      });
    });
    return Array.from(map.values());
  }, [orders, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Mis reseñas - Rossy Resina</title>
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-5 md:py-10">
        <div className="mb-4 flex items-center gap-3 md:hidden">
          <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-950">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-black text-gray-950">Reseñas</h1>
        </div>

        <section className="rounded-lg bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amazon_blue/10 text-amazon_blue">
              <StarIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-950 md:text-2xl">Productos para reseñar</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Elige un producto comprado y publica tu reseña desde su página.
              </p>
            </div>
          </div>

          {status === "loading" || loading ? (
            <p className="mt-5 text-sm text-gray-600">Cargando tus compras...</p>
          ) : !customerSession ? (
            <div className="mt-5 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
              Inicia sesión para ver los productos que puedes reseñar.
              <div className="mt-3">
                <Link href="/sign-in?callbackUrl=/reviews" className="font-black text-amazon_blue">
                  Iniciar sesión
                </Link>
              </div>
            </div>
          ) : purchasedItems.length === 0 ? (
            <div className="mt-5 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
              Aún no tienes productos comprados para reseñar.
              <div className="mt-3">
                <Link href="/productos" className="font-black text-amazon_blue">
                  Ver productos
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {purchasedItems.map((item) => (
                <Link
                  key={`${item.title}-${item.code || item.productId || item._id || ""}`}
                  href={productHref(item)}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <Image src={normalizeImage(item.image)} alt={item.title || "Producto"} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-black text-gray-950">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">Toca para publicar tu reseña</p>
                  </div>
                  <StarIcon className="h-5 w-5 text-amazon_blue" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
