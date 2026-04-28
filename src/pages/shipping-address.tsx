import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ClipboardDocumentListIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline";

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
    <div className="bg-gray-50">
      <Head><title>Direccion de envio - Rossy Resina</title></Head>
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="mb-4 text-sm text-gray-500">Inicio / Cuenta / Dirección de envío</div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5 md:p-7">
            <p className="text-sm font-semibold text-amazon_blue">Cuenta</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">Dirección de envío</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Guarda tus datos principales para completar tus próximas compras con menos pasos.
            </p>
          </div>

          <nav className="grid border-b border-gray-100 md:grid-cols-3">
            <AccountTab href="/account" icon={<UserCircleIcon className="h-5 w-5" />} label="General" />
            <AccountTab href="/track-orders" icon={<ClipboardDocumentListIcon className="h-5 w-5" />} label="Pedidos" />
            <AccountTab href="/shipping-address" icon={<HomeIcon className="h-5 w-5" />} label="Dirección de envío" active />
          </nav>

          {loading ? (
            <div className="p-5 text-sm text-gray-600 md:p-7">Cargando dirección...</div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 md:p-7">
              <label className="grid gap-1 text-sm text-gray-700">
                Nombre completo
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700">
                DNI
                <input value={form.dni} onChange={(e) => update("dni", e.target.value.replace(/\D/g, ""))} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700">
                Teléfono
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                Departamento - Provincia - Distrito
                <input value={form.locationLine} onChange={(e) => update("locationLine", e.target.value)} className="h-11 rounded-md border border-gray-300 px-3" />
              </label>
              <label className="grid gap-1 text-sm text-gray-700 md:col-span-2">
                Tipo de envío
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
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? "Guardando..." : "Guardar dirección"}
                </button>
                <Link href="/account" className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Volver a cuenta
                </Link>
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
