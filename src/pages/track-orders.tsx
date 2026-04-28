import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FormattedPrice from "@/components/FormattedPrice";
import { useSession } from "next-auth/react";
import { ClipboardDocumentListIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const statusTabs = ["Ver todo", "Pendiente por confirmar", "Confirmado", "En proceso de envío", "Enviado"] as const;

type TabKey = (typeof statusTabs)[number];

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  orderCode?: string;
  date: string;
  status: string;
  total: number;
  paymentMethod?: "YAPE" | "TRANSFER";
  paymentMethodLabel?: string;
  shippingCarrier?: "SHALOM" | "OLVA";
  shippingCarrierLabel?: string;
  shalomVoucherImage?: string;
  shalomPickupCode?: string;
  olvaTrackingImage?: string;
  items: OrderItem[];
  customer: {
    email: string;
  };
  paymentImage?: string;
};

export default function TrackOrdersPage() {
  const { data: session } = useSession();
  const isAdminSession = (session?.user as any)?.role === "ADMIN";
  const customerSession = !isAdminSession ? session : null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("Ver todo");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const qEmail = url.searchParams.get("email") || "";
    if (qEmail) setEmail(qEmail);
  }, []);

  const fetchOrders = async () => {
    const lookupEmail = email.trim();
    if (!lookupEmail && isAdminSession) {
      setOrders([]);
      return;
    }
    const url = lookupEmail ? `/api/orders?email=${encodeURIComponent(lookupEmail)}` : "/api/orders";
    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email.trim()) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    const sessionEmail = String((customerSession?.user as any)?.email || "").trim();
    if (!sessionEmail) return;
    setEmail(sessionEmail);
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, [customerSession?.user]);

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      "Pendiente por confirmar": 0,
      Confirmado: 0,
      "En proceso de envío": 0,
      Enviado: 0,
    };
    orders.forEach((o) => {
      if (base[o.status] !== undefined) {
        base[o.status] += 1;
        return;
      }
      if (normalizeStatus(o.status) === normalizeStatus("En proceso de env?o")) {
        base["En proceso de env?o"] += 1;
      }
    });
    return base;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (activeTab !== "Ver todo") {
      list = list.filter((o) => normalizeStatus(o.status) === normalizeStatus(activeTab));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const oid = String(o.orderCode || o.id || "").toLowerCase();
        if (oid.includes(q)) return true;
        if (String(o.id || "").toLowerCase().includes(q)) return true;
        return o.items.some((it) => it.title.toLowerCase().includes(q));
      });
    }
    return list;
  }, [orders, activeTab, search]);

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <Head>
        <title>Mis pedidos - Rossy Resina</title>
        <meta name="description" content="Revisa tus pedidos y recomendaciones personalizadas." />
      </Head>

      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="mb-4 text-sm text-gray-500">Inicio / Cuenta / Pedidos</div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5 md:p-7">
            <p className="text-sm font-semibold text-amazon_blue">Cuenta</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">Mis pedidos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Consulta el estado de tus compras usando tu correo, número de pedido o nombre del producto.
            </p>
          </div>

          <nav className="grid border-b border-gray-100 md:grid-cols-3">
            <AccountTab href="/account" icon={<UserCircleIcon className="h-5 w-5" />} label="General" />
            <AccountTab href="/track-orders" icon={<ClipboardDocumentListIcon className="h-5 w-5" />} label="Pedidos" active />
            <AccountTab href="/shipping-address" icon={<HomeIcon className="h-5 w-5" />} label="Dirección de envío" />
          </nav>

          <div className="border-b border-gray-100 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {statusTabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={
                    "pb-2 border-b-2 " +
                    (activeTab === t ? "border-orange-500 text-gray-900 font-semibold" : "border-transparent text-gray-600")
                  }
                >
                  {t}{t !== "Ver todo" ? ` (${counts[t] || 0})` : ""}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)_auto] xl:items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nº de pedido o artículo"
                className="h-11 w-full min-w-0 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-orange-400"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo para buscar pedidos"
                disabled={Boolean((customerSession?.user as any)?.email)}
                className="h-11 w-full min-w-0 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-600"
              />
              <button
                type="button"
                onClick={fetchOrders}
                className="h-11 w-full rounded-md bg-orange-500 px-5 text-sm font-semibold text-white xl:w-auto"
              >
                Buscar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Cargando pedidos...</div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid gap-4 p-5 md:p-7">
              {filteredOrders.map((o) => (
                <div key={o.id} className="rounded-xl border border-gray-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-gray-900">{o.status}</div>
                      <div className="text-sm text-gray-600">Pedido: {o.orderCode || o.id}</div>
                      <div className="text-sm text-gray-600">Fecha: {o.date}</div>
                    </div>
                    {normalizeStatus(o.status) === normalizeStatus("Confirmado") && (
                      <div className="mt-2 text-sm text-emerald-700">
                        Pedido confirmado. En proceso de envío. Comunícate al 961770723 para seguimiento.
                      </div>
                    )}
                    {normalizeStatus(o.status) === normalizeStatus("En proceso de env?o") && (
                      <div className="mt-2 text-sm text-emerald-700">
                        En proceso de envío. Comunícate al 961770723 para seguimiento.
                      </div>
                    )}
                    {o.status === "Enviado" && (
                      <div className="mt-2 text-sm text-emerald-700 space-y-1">
                        <p>Tu pedido fue enviado por {o.shippingCarrierLabel || "agencia"}.</p>
                        {o.shippingCarrier === "SHALOM" && o.shalomPickupCode && (
                          <p>Clave de recojo: <strong>{o.shalomPickupCode}</strong></p>
                        )}
                        {o.shippingCarrier === "SHALOM" && o.shalomVoucherImage && (
                          <p>
                            <a href={o.shalomVoucherImage} target="_blank" rel="noreferrer" className="text-amazon_blue hover:underline">
                              Ver voucher de envío
                            </a>
                          </p>
                        )}
                        {o.shippingCarrier === "OLVA" && o.olvaTrackingImage && (
                          <p>
                            <a href={o.olvaTrackingImage} target="_blank" rel="noreferrer" className="text-amazon_blue hover:underline">
                              Ver tracking de Olva
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-4 border-t border-gray-100 pt-4 grid gap-3">
                      <div className="text-xs text-gray-600">
                        Método de pago: <span className="font-semibold text-gray-800">{o.paymentMethodLabel || "Transferencia/Yape"}</span>
                      </div>
                      {o.items.map((it, idx) => (
                        <div key={`${o.id}-${idx}`} className="grid grid-cols-[72px_minmax(0,1fr)_140px] gap-3 items-center">
                          <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                            {it.image ? (
                              <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                            ) : (
                              "Producto"
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 line-clamp-2">{it.title}</p>
                            <p className="text-xs text-gray-500">x{it.quantity}</p>
                          </div>
                          <div className="text-right text-sm text-gray-900">
                            <FormattedPrice amount={it.price} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                      <div className="text-sm font-semibold text-gray-900">
                        Total: <FormattedPrice amount={o.total} />
                      </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 md:p-7">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Aún no has realizado pedidos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cuando completes tu primera compra, podrás consultar aquí su estado.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/productos"
                    className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:brightness-95"
                  >
                    Ver productos
                  </Link>
                  <Link
                    href="/account"
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Volver a cuenta
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AccountTab({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-b border-gray-100 px-5 py-4 text-sm font-semibold transition-colors last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${
        active ? "bg-gray-50 text-amazon_blue" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className={active ? "text-amazon_blue" : "text-gray-500"}>{icon}</span>
      {label}
    </Link>
  );
}
  const normalizeStatus = (value: string) =>
    String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
