import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type Order = {
  id: string;
  orderCode?: string;
  createdAt?: string;
  date: string;
  status: string;
  workflowStatus?: string;
  total: number;
  paymentMethod?: "YAPE" | "TRANSFER";
  paymentMethodLabel?: string;
  shippingCarrier?: "SHALOM" | "OLVA";
  shippingCarrierLabel?: string;
  shalomVoucherImage?: string;
  shalomPickupCode?: string;
  olvaTrackingImage?: string;
  items: any[];
  customer: {
    name: string;
    email: string;
    phone: string;
    dni?: string;
    locationLine?: string;
    department?: string;
    province?: string;
    district: string;
    address: string;
    reference?: string;
    shalomAgency?: string;
    notes?: string;
  };
  paymentImage?: string;
};

const statusOptions = [
  "Pendiente por confirmar",
  "Confirmado",
  "En proceso de env?o",
  "Enviado",
  "Finalizado",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipData, setShipData] = useState<Record<string, { shalomVoucherImage: string; shalomPickupCode: string; olvaTrackingImage: string }>>({});
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [includeHistory, setIncludeHistory] = useState(false);
  const [shipModalOrder, setShipModalOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders${includeHistory ? "?includeHistory=1" : ""}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setOrders(rows);
      setShipData((prev) => {
        const next = { ...prev };
        rows.forEach((o: Order) => {
          const existing = next[o.id] || { shalomVoucherImage: "", shalomPickupCode: "", olvaTrackingImage: "" };
          next[o.id] = {
            shalomVoucherImage: existing.shalomVoucherImage || String(o.shalomVoucherImage || ""),
            shalomPickupCode: existing.shalomPickupCode || String(o.shalomPickupCode || ""),
            olvaTrackingImage: existing.olvaTrackingImage || String(o.olvaTrackingImage || ""),
          };
        });
        return next;
      });
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [includeHistory]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const setShipField = (orderId: string, key: "shalomVoucherImage" | "shalomPickupCode" | "olvaTrackingImage", value: string) => {
    setShipData((prev) => ({
      ...prev,
      [orderId]: {
        shalomVoucherImage: prev[orderId]?.shalomVoucherImage || "",
        shalomPickupCode: prev[orderId]?.shalomPickupCode || "",
        olvaTrackingImage: prev[orderId]?.olvaTrackingImage || "",
        [key]: value,
      },
    }));
  };

  const uploadImage = async (file: File) => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, data: dataUrl }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.url) throw new Error(body?.error || "No se pudo subir la imagen");
    return String(body.url);
  };

  const handleShipImage = async (orderId: string, key: "shalomVoucherImage" | "olvaTrackingImage", file?: File | null) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setShipField(orderId, key, url);
    } catch (e: any) {
      alert(e?.message || "No se pudo subir la imagen");
    }
  };

  const updateStatus = async (order: Order, status: string, opts?: { notify?: boolean; closeModal?: boolean }) => {
    const payload = {
      status,
      shalomVoucherImage: shipData[order.id]?.shalomVoucherImage || "",
      shalomPickupCode: shipData[order.id]?.shalomPickupCode || "",
      olvaTrackingImage: shipData[order.id]?.olvaTrackingImage || "",
    };
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = await res.json().catch(() => null);
    if (!res.ok) {
      alert(updated?.error || "No se pudo actualizar el pedido");
      return;
    }
    if (updated && opts?.notify) notifyByWhatsApp(updated as Order, status);
    if (opts?.closeModal) setShipModalOrder(null);
    loadOrders();
  };

  const normalizePhone = (raw: string) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("51")) return digits;
    if (digits.length === 9) return `51${digits}`;
    return digits;
  };

  const statusText = (status: string) => {
    const s = String(status || "").trim().toLowerCase();
    if (s.includes("confirmado")) return "fue confirmado";
    if (s.includes("proceso")) return "esta en preparacion";
    if (s.includes("enviado")) return "fue enviado";
    if (s.includes("finalizado")) return "fue finalizado";
    return "fue actualizado";
  };

  const notifyByWhatsApp = (order: Order, nextStatus?: string) => {
    const phone = normalizePhone(order?.customer?.phone || "");
    if (!phone) return;
    const code = order.orderCode || order.id;
    const shalomCode = String(order.shalomPickupCode || "");
    const shalomVoucher = String(order.shalomVoucherImage || "");
    const olvaTracking = String(order.olvaTrackingImage || "");
    const carrier = order.shippingCarrier === "OLVA" ? "Olva Courier" : "Shalom";
    const msg = [
      `Hola ${order.customer?.name || ""},`,
      `tu pedido ${code} ${statusText(nextStatus || order.status)}.`,
      `Estado actual: ${nextStatus || order.status}.`,
      `Agencia: ${carrier}.`,
      ...(order.shippingCarrier === "SHALOM"
        ? [
            shalomCode ? `Clave Shalom: ${shalomCode}` : "",
            shalomVoucher ? `Voucher Shalom: ${shalomVoucher}` : "",
          ]
        : [olvaTracking ? `Tracking Olva: ${olvaTracking}` : ""]),
      "Gracias por comprar en Rossy Resina.",
    ]
      .filter(Boolean)
      .join("\n");
    const wa = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
  };

  const filteredOrders = statusFilter === "Todos"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin - Pedidos</title>
      </Head>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-600 inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeHistory}
              onChange={(e) => setIncludeHistory(e.target.checked)}
            />
            Historial completo
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded border border-gray-300 bg-white"
          >
            <option value="Todos">Todos</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button onClick={loadOrders} className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50">Actualizar</button>
          <Link href="/admin" className="text-sm text-amazon_blue hover:underline">Volver</Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">Cargando...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          Todavia no hay pedidos registrados.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{o.customer?.name || "Cliente"}</div>
                <div className="text-xs text-gray-500">{o.customer?.email}</div>
                <div className="text-xs text-gray-500">{o.customer?.phone}</div>
                <div className="text-xs text-gray-500">Fecha: {o.date}</div>
                <div className="text-xs text-gray-500">Pedido: {o.orderCode || o.id}</div>
                <div className="text-sm font-semibold">{o.status}</div>
              </div>

              <div className="mt-3 grid md:grid-cols-2 gap-4">
                <div className="text-sm text-gray-700">
                  <div className="mb-2"><strong>Cotizacion enviada:</strong></div>
                  <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                    {(o.items || []).map((it: any, idx: number) => (
                      <li key={`${o.id}-${idx}`}>
                        {it.title || "Producto"} x{Number(it.quantity || 1)}  -  S/ {Number(it.price || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <div><strong>DNI:</strong> {o.customer?.dni || "-"}</div>
                  <div><strong>Ubicacion:</strong> {o.customer?.locationLine || "-"}</div>
                  <div><strong>Agencia de env?o:</strong> {o.shippingCarrierLabel || "Shalom"}</div>
                  {o.shippingCarrier === "SHALOM" ? (
                    <div><strong>Agencia Shalom:</strong> {o.customer?.shalomAgency || "-"}</div>
                  ) : (
                    <>
                      <div><strong>Direccion Olva:</strong> {o.customer?.address || "-"}</div>
                      <div><strong>Referencia:</strong> {o.customer?.reference || "-"}</div>
                    </>
                  )}
                  <div><strong>M?todo de pago:</strong> {o.paymentMethodLabel || "Yape"}</div>
                  <div><strong>Telefono:</strong> {o.customer?.phone || "-"}</div>
                  {o.status === "Enviado" && (
                    <div className="mt-3 rounded-md border border-gray-200 p-3">
                      <p className="text-xs font-semibold text-gray-700">Datos para estado Enviado</p>
                      {o.shippingCarrier === "SHALOM" ? (
                        <div className="mt-2 grid gap-2">
                          <label className="text-xs text-gray-600">Clave Shalom</label>
                          <input
                            value={shipData[o.id]?.shalomPickupCode || ""}
                            onChange={(e) => setShipField(o.id, "shalomPickupCode", e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                          />
                          <label className="text-xs text-gray-600">Voucher Shalom (imagen)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleShipImage(o.id, "shalomVoucherImage", e.target.files?.[0])}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                          />
                          {shipData[o.id]?.shalomVoucherImage && (
                            <a href={shipData[o.id].shalomVoucherImage} target="_blank" rel="noreferrer" className="text-xs text-amazon_blue hover:underline">
                              Ver voucher Shalom
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 grid gap-2">
                          <label className="text-xs text-gray-600">Tracking Olva (imagen voucher)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleShipImage(o.id, "olvaTrackingImage", e.target.files?.[0])}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                          />
                          {shipData[o.id]?.olvaTrackingImage && (
                            <a href={shipData[o.id].olvaTrackingImage} target="_blank" rel="noreferrer" className="text-xs text-amazon_blue hover:underline">
                              Ver tracking Olva
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {o.customer?.notes && <div><strong>Notas:</strong> {o.customer.notes}</div>}
                  <div className="mt-2"><strong>Total:</strong> S/ {Number(o.total || 0).toFixed(2)}</div>
                </div>
                <div>
                  {o.paymentImage ? (
                    <a href={o.paymentImage} target="_blank" rel="noreferrer" className="block">
                      <img src={o.paymentImage} alt="Comprobante" className="max-h-40 rounded border border-gray-200 hover:opacity-90" />
                      <p className="text-xs text-amazon_blue mt-1">Ver comprobante en grande</p>
                    </a>
                  ) : (
                    <div className="text-xs text-gray-500">Sin comprobante adjunto</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => notifyByWhatsApp({
                    ...o,
                    shalomPickupCode: shipData[o.id]?.shalomPickupCode || o.shalomPickupCode || "",
                    shalomVoucherImage: shipData[o.id]?.shalomVoucherImage || o.shalomVoucherImage || "",
                    olvaTrackingImage: shipData[o.id]?.olvaTrackingImage || o.olvaTrackingImage || "",
                  })}
                  className="px-3 py-1 rounded border border-green-600 text-green-700 text-xs hover:bg-green-50"
                >
                  Notificar WhatsApp
                </button>
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (s === "Enviado") {
                        setShipModalOrder(o);
                        return;
                      }
                      updateStatus(o, s);
                    }}
                    className={
                      "px-3 py-1 rounded border text-xs " +
                      (o.status === s ? "border-orange-500 text-orange-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {shipModalOrder && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-semibold">Enviar pedido y notificar por WhatsApp</h2>
            <p className="text-sm text-gray-600 mt-1">
              Pedido: <strong>{shipModalOrder.orderCode || shipModalOrder.id}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Agencia: <strong>{shipModalOrder.shippingCarrierLabel || "Shalom"}</strong>
            </p>

            {shipModalOrder.shippingCarrier === "SHALOM" ? (
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-sm text-gray-600">Clave Shalom</label>
                  <input
                    value={shipData[shipModalOrder.id]?.shalomPickupCode || ""}
                    onChange={(e) => setShipField(shipModalOrder.id, "shalomPickupCode", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Voucher Shalom (foto)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleShipImage(shipModalOrder.id, "shalomVoucherImage", e.target.files?.[0])}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  />
                  {shipData[shipModalOrder.id]?.shalomVoucherImage && (
                    <a href={shipData[shipModalOrder.id].shalomVoucherImage} target="_blank" rel="noreferrer" className="text-xs text-amazon_blue hover:underline">
                      Ver voucher cargado
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-sm text-gray-600">Tracking Olva (foto voucher)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleShipImage(shipModalOrder.id, "olvaTrackingImage", e.target.files?.[0])}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  />
                  {shipData[shipModalOrder.id]?.olvaTrackingImage && (
                    <a href={shipData[shipModalOrder.id].olvaTrackingImage} target="_blank" rel="noreferrer" className="text-xs text-amazon_blue hover:underline">
                      Ver tracking cargado
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShipModalOrder(null)}
                className="px-4 py-2 rounded border border-gray-300 text-sm font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => updateStatus(shipModalOrder, "Enviado", { notify: false, closeModal: true })}
                className="px-4 py-2 rounded border border-orange-500 text-orange-700 text-sm font-semibold hover:bg-orange-50"
              >
                Guardar Enviado
              </button>
              <button
                type="button"
                onClick={() => updateStatus(shipModalOrder, "Enviado", { notify: true, closeModal: true })}
                className="px-4 py-2 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
              >
                Guardar y enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/orders", permanent: false } };
  return { props: {} };
};
