import { useEffect, useState } from "react";
import Head from "next/head";

type PromoForm = {
  active: boolean;
  minimumSubtotal: number;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number;
};

const toLocalInput = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(+date)) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminPromocionesPage() {
  const [form, setForm] = useState<PromoForm>({
    active: true,
    minimumSubtotal: 100,
    discountValue: 20,
    startsAt: "",
    endsAt: "",
    maxUses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/promo-web20", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setForm({
          active: Boolean(data.active),
          minimumSubtotal: Number(data.minimumSubtotal || 100),
          discountValue: Number(data.discountValue || 20),
          startsAt: toLocalInput(data.startsAt),
          endsAt: toLocalInput(data.endsAt),
          maxUses: Number(data.maxUses || 0),
        });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-web20", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo guardar la promoción.");
      setMessage("Promoción WEB20 guardada correctamente.");
    } catch (error: any) {
      setMessage(error?.message || "No se pudo guardar la promoción.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl bg-white p-6 text-sm font-semibold text-gray-700">Cargando promoción...</div>;
  }

  return (
    <>
      <Head>
        <title>Promociones | Admin Rossy Resina</title>
      </Head>
      <div className="max-w-4xl space-y-5">
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-amazon_blue">WEB20</p>
              <h1 className="mt-1 text-2xl font-black text-gray-950">Promoción web exclusiva</h1>
              <p className="mt-1 text-sm text-gray-600">S/20 de descuento en compras desde S/100.</p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-black">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Activa
            </label>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Monto mínimo requerido
            <input
              type="number"
              min={0}
              value={form.minimumSubtotal}
              onChange={(event) => setForm((prev) => ({ ...prev, minimumSubtotal: Number(event.target.value || 0) }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Valor del descuento
            <input
              type="number"
              min={0}
              value={form.discountValue}
              onChange={(event) => setForm((prev) => ({ ...prev, discountValue: Number(event.target.value || 0) }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Fecha inicio
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Fecha fin
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700 md:col-span-2">
            Número máximo de usos
            <input
              type="number"
              min={0}
              value={form.maxUses}
              onChange={(event) => setForm((prev) => ({ ...prev, maxUses: Number(event.target.value || 0) }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            <span className="text-xs font-normal text-gray-500">Usa 0 para no limitar usos globales.</span>
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-amazon_blue px-5 py-2 text-sm font-black text-white hover:brightness-95 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar promoción"}
            </button>
            {message ? <p className="mt-3 text-sm font-semibold text-gray-700">{message}</p> : null}
          </div>
        </section>
      </div>
    </>
  );
}
