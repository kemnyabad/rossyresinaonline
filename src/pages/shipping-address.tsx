import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type ShippingCarrier = "SHALOM" | "OLVA";

const emptyProfile = {
  dni: "",
  name: "",
  phone: "",
  locationLine: "",
  shippingCarrier: "SHALOM" as ShippingCarrier,
  shalomAgency: "",
  olvaAddress: "",
  olvaReference: "",
};

export default function ShippingAddressPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const sessionEmail = String((session?.user as any)?.email || "").trim().toLowerCase();

  useEffect(() => {
    if (!sessionEmail) return;
    let alive = true;
    const local = window.localStorage.getItem(`rr_shipping_profile:${sessionEmail}`);
    if (local) {
      try {
        setForm({ ...emptyProfile, ...JSON.parse(local) });
      } catch {}
    }
    fetch("/api/account/shipping-profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive) return;
        if (data?.profile) {
          setForm({ ...emptyProfile, ...data.profile });
          window.localStorage.setItem(`rr_shipping_profile:${sessionEmail}`, JSON.stringify(data.profile));
        } else if (!local) {
          setForm((prev) => ({ ...prev, name: String((session?.user as any)?.name || "") }));
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [sessionEmail, session]);

  const update = (key: keyof typeof emptyProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/account/shipping-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setForm({ ...emptyProfile, ...data.profile });
      if (sessionEmail) {
        window.localStorage.setItem(`rr_shipping_profile:${sessionEmail}`, JSON.stringify(data.profile));
      }
      setMessage("Direccion de envio guardada.");
    } catch (error: any) {
      setMessage(error?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
      <Head><title>Direccion de envio - Rossy Resina</title></Head>
      <div className="text-sm text-gray-500 mb-4">Inicio / Cuenta / Dirección de envío</div>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
          <h2 className="text-lg font-semibold mb-3">Cuenta</h2>
          <nav className="flex flex-col gap-2 text-sm text-gray-700">
            <Link href="/account" className="px-2 py-1 rounded hover:bg-gray-50">General</Link>
            <Link href="/track-orders" className="px-2 py-1 rounded hover:bg-gray-50">Pedidos</Link>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Pago</span>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Reembolsos y devoluciones</span>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Valoraciones</span>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Ajustes</span>
            <span className="px-2 py-1 rounded bg-gray-50 font-semibold">Dirección de envío</span>
            <Link href="/messages" className="px-2 py-1 rounded hover:bg-gray-50">Centro de mensajes</Link>
          </nav>
        </aside>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dirección de envío</h1>
          <p className="mt-1 text-sm text-gray-600">Esta información se usará automáticamente en tus próximas compras.</p>

          {loading ? (
            <p className="mt-6 text-sm text-gray-600">Cargando direccion...</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm text-gray-700">
                Nombre completo
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700">
                DNI
                <input value={form.dni} onChange={(e) => update("dni", e.target.value.replace(/\D/g, ""))} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700">
                Telefono
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                Departamento - Provincia - Distrito
                <input value={form.locationLine} onChange={(e) => update("locationLine", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                Tipo de envio
                <select value={form.shippingCarrier} onChange={(e) => update("shippingCarrier", e.target.value === "OLVA" ? "OLVA" : "SHALOM")} className="h-11 rounded-md border border-gray-300 bg-white px-3">
                  <option value="SHALOM">Recoger en agencia Shalom</option>
                  <option value="OLVA">Entrega a domicilio por Olva</option>
                </select>
              </label>
              {form.shippingCarrier === "SHALOM" ? (
                <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                  Agencia Shalom
                  <input value={form.shalomAgency} onChange={(e) => update("shalomAgency", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
                </label>
              ) : (
                <>
                  <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                    Dirección exacta
                    <input value={form.olvaAddress} onChange={(e) => update("olvaAddress", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
                  </label>
                  <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                    Referencia
                    <textarea value={form.olvaReference} onChange={(e) => update("olvaReference", e.target.value)} className="min-h-[88px] rounded-md border border-gray-300 px-3 py-2" />
                  </label>
                </>
              )}
              {message && <p className="text-sm text-gray-700 md:col-span-2">{message}</p>}
              <div className="flex gap-3 md:col-span-2">
                <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? "Guardando..." : "Guardar dirección"}
                </button>
                <Link href="/checkout" className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Ir al checkout
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
