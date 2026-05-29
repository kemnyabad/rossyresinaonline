import Head from "next/head";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const benefits = [
  { title: "Publica tus productos", icon: PaintBrushIcon },
  { title: "Llega a más clientes", icon: MegaphoneIcon },
  { title: "Impulsa tu emprendimiento", icon: SparklesIcon },
  { title: "Recibe consultas por WhatsApp", icon: ShoppingBagIcon },
  { title: "Forma parte de una comunidad creativa", icon: UserGroupIcon },
];

const steps = [
  "Regístrate con tus datos.",
  "Publica tus productos artesanales.",
  "Comparte tu tienda y recibe consultas de clientes.",
];

const VendeConNosotrosPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [logoData, setLogoData] = useState("");
  const [logoNotice, setLogoNotice] = useState("");
  const [marketplaceContext, setMarketplaceContext] = useState<any>(null);
  const [contextLoading, setContextLoading] = useState(true);

  const loadMarketplaceContext = async () => {
    setContextLoading(true);
    try {
      const res = await fetch("/api/marketplace/me", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (res.ok) setMarketplaceContext(data);
      else setMarketplaceContext(null);
    } catch {
      setMarketplaceContext(null);
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceContext();
  }, []);

  const application = marketplaceContext?.application || null;
  const shop = marketplaceContext?.shop || null;
  const applicationStatus = String(application?.status || "");
  const isApproved = marketplaceContext?.role === "SELLER" || applicationStatus === "APPROVED";
  const isPending = applicationStatus === "PENDING";
  const isRejected = applicationStatus === "REJECTED";
  const shouldShowForm = !application || isRejected;

  const handleLogoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoNotice("");
    if (file.size > 700 * 1024) {
      setLogoData("");
      setLogoNotice("El logo es muy pesado para enviarlo desde el formulario. Puedes pegar un link del logo o enviarlo luego por WhatsApp.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoData(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      fullName: String(data.get("nombre") || ""),
      businessName: String(data.get("emprendimiento") || ""),
      city: String(data.get("ciudad") || ""),
      whatsapp: String(data.get("whatsapp") || ""),
      productType: String(data.get("productos") || ""),
      description: String(data.get("descripcion") || ""),
      socialUrl: String(data.get("redes") || ""),
      logoUrl: logoData || String(data.get("logoUrl") || ""),
    };
    try {
      const res = await fetch("/api/marketplace/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(async () => {
        const text = await res.text().catch(() => "");
        return { error: text };
      });
      if (!res.ok) {
        const message = String(body?.error || "No se pudo enviar la solicitud.");
        setError(message.includes("<!DOCTYPE") ? "No se pudo enviar la solicitud. Intenta sin subir imagen o inicia sesión nuevamente." : message);
        return;
      }
      setSubmitted(true);
      setMarketplaceContext((current: any) => ({
        ...(current || {}),
        role: "CUSTOMER",
        application: body.application,
      }));
      await loadMarketplaceContext();
      form.reset();
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vende con nosotros | Rossy Resina</title>
        <meta
          name="description"
          content="Vende tus creaciones en Rossy Resina y forma parte de una comunidad de emprendedoras creativas."
        />
      </Head>

      <main className="bg-white text-slate-950">
        <section className="border-b border-pink-100 bg-gradient-to-b from-[#fff4f9] to-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
            <div className="flex flex-col justify-center">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-bold text-[#e4147f]">
                <ShoppingBagIcon className="h-5 w-5" />
                Vende con nosotros
              </span>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                Vende tus creaciones en Rossy Resina
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
                Forma parte de nuestra comunidad de emprendedoras y muestra tus productos personalizados a más clientes.
              </p>
              <a
                href={isApproved ? "/mi-tienda" : "#registro"}
                className="mt-8 inline-flex h-12 w-fit items-center justify-center rounded-lg bg-[#e4147f] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#c21885]"
              >
                {isApproved ? "Ir a Mi Tienda" : application ? "Ver mi solicitud" : "Quiero registrarme"}
              </a>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-[0_18px_45px_rgba(228,20,127,0.12)]">
              <div className="rounded-xl bg-slate-950 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide text-pink-200">Comunidad creativa</p>
                <p className="mt-4 text-3xl font-black leading-tight">Un espacio para emprendedoras artesanales.</p>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Presenta tus piezas, conecta con clientas interesadas y haz crecer tu marca con una vitrina pensada para productos personalizados.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">Beneficios</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Crece con una vitrina enfocada en artesanía</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f7] text-[#e4147f]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-bold leading-6 text-slate-950">{benefit.title}</h3>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-pink-100 bg-[#fff8fb]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">¿Cómo funciona?</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Tres pasos para empezar</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step} className="rounded-xl border border-pink-100 bg-white p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="mt-5 text-base font-semibold leading-7 text-slate-800">
                    Paso {index + 1}: {step}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="registro" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">Formulario de registro</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {application ? "Estado de tu solicitud" : "Cuéntanos sobre tu emprendimiento"}
              </h2>
            </div>

            {contextLoading && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                Consultando tu información de vendedora...
              </div>
            )}

            {application && (
              <ApplicationStatusPanel
                application={application}
                shop={shop}
                isApproved={isApproved}
                isPending={isPending}
                isRejected={isRejected}
              />
            )}

            {submitted && (
              <div className="mb-6 flex gap-3 rounded-xl border border-pink-200 bg-[#fff0f7] p-4 text-sm font-semibold text-slate-800">
                <CheckCircleIcon className="h-6 w-6 shrink-0 text-[#e4147f]" />
                Gracias por registrarte. Revisaremos tu solicitud y nos comunicaremos contigo por WhatsApp.
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}{" "}
                {error.includes("iniciar") && (
                  <Link href="/sign-in?callbackUrl=/vende-con-nosotros" className="underline">
                    Iniciar sesión
                  </Link>
                )}
              </div>
            )}

            {shouldShowForm && (
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              {isRejected && (
                <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  Tu solicitud fue rechazada. Puedes corregir la información y enviarla nuevamente.
                </div>
              )}
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Nombre completo
                <input required name="nombre" defaultValue={application?.fullName || ""} className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Nombre del emprendimiento
                <input required name="emprendimiento" defaultValue={application?.businessName || ""} className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Ciudad
                <input required name="ciudad" defaultValue={application?.city || ""} className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                WhatsApp
                <input required name="whatsapp" type="tel" defaultValue={application?.whatsapp || ""} className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800 md:col-span-2">
                Tipo de productos que vende
                <input required name="productos" defaultValue={application?.productType || ""} className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800 md:col-span-2">
                Breve descripción del emprendimiento
                <textarea required name="descripcion" rows={4} defaultValue={application?.description || ""} className="rounded-lg border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Link de redes sociales
                <input name="redes" type="url" defaultValue={application?.socialUrl || ""} placeholder="https://instagram.com/..." className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Link de foto o logo del emprendimiento
                <input name="logoUrl" type="url" defaultValue={application?.logoUrl || ""} placeholder="https://..." className="h-12 rounded-lg border border-slate-200 px-4 font-medium outline-none focus:border-[#e4147f]" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-800 md:col-span-2">
                Subir foto o logo del emprendimiento
                <input onChange={handleLogoFile} type="file" accept="image/*" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium file:mr-4 file:rounded-md file:border-0 file:bg-[#fff0f7] file:px-3 file:py-2 file:font-bold file:text-[#e4147f]" />
                {logoNotice && <span className="text-xs font-semibold text-amber-700">{logoNotice}</span>}
              </label>
              <div className="md:col-span-2">
                <button type="submit" disabled={sending} className="h-12 rounded-lg bg-slate-950 px-6 text-base font-bold text-white transition-colors hover:bg-[#e4147f] disabled:opacity-60">
                  {sending ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

function ApplicationStatusPanel({
  application,
  shop,
  isApproved,
  isPending,
  isRejected,
}: {
  application: any;
  shop: any;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
}) {
  const statusLabel = isApproved ? "Aprobada" : isRejected ? "Rechazada" : "Pendiente";
  const statusClass = isApproved
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : isRejected
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
      <div className="border-b border-pink-100 bg-[#fff8fb] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">Tu información de vendedora</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{application.businessName || "Emprendimiento sin nombre"}</h3>
          </div>
          <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-black ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        {isPending && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Estos son los datos que recibimos. Cuando el administrador apruebe tu solicitud, esta información se usará para crear tu tienda.
          </p>
        )}
        {isApproved && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Tu solicitud está aprobada. Ya puedes entrar a Mi Tienda para publicar productos y gestionar tu emprendimiento.
          </p>
        )}
        {isRejected && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Revisa la observación del equipo y vuelve a enviar tu información corregida.
          </p>
        )}
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-start gap-3">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-pink-100 bg-[#fff0f7] text-[#e4147f]">
            {application.logoUrl ? (
              <img src={application.logoUrl} alt={application.businessName || "Logo del emprendimiento"} className="h-full w-full object-cover" />
            ) : (
              <ShoppingBagIcon className="h-10 w-10" />
            )}
          </div>
          {shop?.slug && (
            <Link href={`/tienda/${shop.slug}`} className="text-sm font-bold text-[#e4147f] hover:underline">
              Ver tienda pública
            </Link>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Nombre completo" value={application.fullName} />
          <InfoItem label="Nombre comercial" value={application.businessName} />
          <InfoItem label="Ciudad" value={application.city} />
          <InfoItem label="WhatsApp" value={application.whatsapp} />
          <InfoItem label="Tipo de productos" value={application.productType} />
          <InfoItem label="Redes sociales" value={application.socialUrl} />
          <div className="sm:col-span-2">
            <InfoItem label="Descripción que aparecerá en tu tienda" value={application.description} />
          </div>
          {application.note && (
            <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Observación del administrador</p>
              <p className="mt-1 text-sm font-semibold text-amber-900">{application.note}</p>
            </div>
          )}
          {isApproved && (
            <div className="sm:col-span-2">
              <Link href="/mi-tienda" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#e4147f] px-5 text-sm font-bold text-white">
                Entrar a Mi Tienda
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-slate-900">
        {String(value || "").trim() || "No registrado"}
      </p>
    </div>
  );
}

export default VendeConNosotrosPage;
