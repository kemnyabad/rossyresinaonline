import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { FaHandPointer } from "react-icons/fa";

type FormState = {
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  email: string;
  experiencia: string;
  objetivo: string;
  acepta: boolean;
};

const initialForm: FormState = {
  nombres: "",
  apellidos: "",
  dni: "",
  celular: "",
  email: "",
  experiencia: "",
  objetivo: "",
  acepta: false,
};

const whatsappGroupUrl = "https://chat.whatsapp.com/LL8QQddRrGYLxuV8j7BnBA";

export default function CursoRedesSocialesPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.nombres.trim() || !form.apellidos.trim() || !form.celular.trim() || !form.email.trim()) {
      setError("Completa nombres, apellidos, celular y correo.");
      return;
    }
    if (!form.acepta) {
      setError("Autoriza el contacto para poder registrar tu solicitud.");
      return;
    }

    setSending(true);
    const res = await fetch("/api/capacitaciones/inscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: `${form.nombres.trim()} ${form.apellidos.trim()}`.trim(),
        email: form.email.trim(),
        telefono: form.celular.trim(),
        curso: "Curso online: Vende por redes sociales",
        nivel: form.experiencia || "Inicial",
        mensaje: JSON.stringify({
          dni: form.dni.trim(),
          objetivo: form.objetivo.trim(),
          origen: "Landing curso redes sociales",
          fechaCurso: "Viernes 5 de Junio - 6 PM",
          inversion: "S/20",
        }),
      }),
    });
    const body = await res.json().catch(() => ({}));
    setSending(false);

    if (!res.ok) {
      setError(String(body?.error || "No se pudo registrar tu solicitud."));
      return;
    }

    setSent(true);
    setForm(initialForm);
  };

  return (
    <>
      <Head>
        <title>Curso online: Vende por redes sociales | Rossy Resina</title>
        <meta
          name="description"
          content="Inscríbete al curso online Vende por redes sociales y aprende a vender tus artesanías por Facebook, Instagram y TikTok."
        />
      </Head>

      <main className="course-landing min-h-screen bg-gradient-to-br from-[#ffe0ee] via-[#fff8fb] to-[#f8cfe5]">
        <section className="relative overflow-hidden">
          <div className="relative mx-auto grid max-w-screen-2xl gap-6 px-4 pb-5 pt-1 sm:px-6 md:py-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-8 lg:px-8 xl:grid-cols-[minmax(0,1fr)_500px]">
            <div className="min-w-0">
              <div className="mb-1 lg:hidden">
                <Link href="/" className="text-xs font-semibold text-white/90 underline underline-offset-2">
                  Ir a Tienda
                </Link>
              </div>
              <div className="relative aspect-[1962/331] w-full overflow-hidden rounded-lg bg-white/50 shadow-[0_16px_44px_rgba(228,20,127,0.13)] ring-1 ring-white/80">
                <Image
                  src="/banners/curso-redes-sociales-web.png"
                  alt="Curso online vende por redes sociales"
                  fill
                  priority
                  className="object-contain"
                  sizes="(min-width: 1024px) 900px, 100vw"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 lg:mt-6">
                <Benefit
                  icon={<Image src="/icons/incremento-de-ventas.png" alt="" width={96} height={96} className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24" />}
                  title="Más ventas"
                  text="Aprende a convertir seguidores en clientes."
                  plainIcon
                />
                <Benefit
                  icon={<Image src="/icons/bocina.png" alt="" width={96} height={96} className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24" />}
                  title="Contenido claro"
                  text="Publicaciones que explican, atraen y venden."
                  plainIcon
                />
                <Benefit
                  icon={<Image src="/icons/clasificacion.png" alt="" width={96} height={96} className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24" />}
                  title="Redes ordenadas"
                  text="Facebook, Instagram y TikTok con estrategia."
                  plainIcon
                />
              </div>

              <div className="mt-5 rounded-xl border border-[#f3b6d5] bg-white/95 p-4 shadow-[0_14px_34px_rgba(228,20,127,0.11)] ring-1 ring-white/80 sm:p-5 lg:mt-6">
                <p className="text-sm font-black uppercase tracking-wide text-[#e4147f]">Qué aprenderás</p>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm font-semibold leading-6 text-slate-800 md:grid-cols-2 md:text-base">
                  <InfoItem text="Cómo presentar tus artesanías para vender mejor." />
                  <InfoItem text="Ideas de contenido para productos personalizados." />
                  <InfoItem text="Cómo responder mensajes y cerrar pedidos." />
                  <InfoItem text="Cómo organizar una rutina simple de ventas." />
                </div>
              </div>
            </div>

            <aside className="relative rounded-xl bg-white p-4 shadow-[0_18px_52px_rgba(28,7,48,0.14)] ring-1 ring-slate-200/70 sm:p-5 md:p-6 lg:sticky lg:top-24 lg:pt-12">
              {sent ? (
                <div className="flex min-h-[440px] flex-col justify-center text-center">
                  <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-500" />
                  <h1 className="mt-4 text-2xl font-black text-slate-950">Registro recibido</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Te contactaremos para confirmar tu acceso al curso. También puedes entrar al grupo para recibir indicaciones.
                  </p>
                  <a
                    href={whatsappGroupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#e4147f] px-6 text-sm font-black text-white"
                  >
                    Unirme al grupo <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                  </a>
                </div>
              ) : (
                <>
                  <div>
                    <div className="rr-cta-pulse mx-auto inline-flex h-11 items-center gap-3 rounded-full border-[5px] border-white bg-[#ffd21f] pl-5 pr-2 text-sm font-black uppercase tracking-wide text-black shadow-[0_12px_26px_rgba(17,24,39,0.14)] sm:h-12 sm:text-base lg:absolute lg:-top-3 lg:left-1/2 lg:-translate-x-1/2">
                      Inscríbete aquí
                      <span className="rr-icon-pop flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                        <FaHandPointer className="h-4 w-4 -rotate-12" />
                      </span>
                    </div>
                    <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">Deja tus datos y separa tu cupo</h1>
                    <p className="mt-3 inline-flex rounded-full bg-[#fff4f9] px-4 py-2 text-sm font-black leading-6 text-[#e4147f] ring-1 ring-[#f5b8d8] sm:text-base">
                      Curso online, viernes 5 de Junio, 6 PM. Inversión: S/20.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nombres">
                        <input value={form.nombres} onChange={(e) => update("nombres", e.target.value)} placeholder="Nombres" className="field" />
                      </Field>
                      <Field label="Apellidos">
                        <input value={form.apellidos} onChange={(e) => update("apellidos", e.target.value)} placeholder="Apellidos" className="field" />
                      </Field>
                      <Field label="DNI">
                        <input value={form.dni} onChange={(e) => update("dni", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="DNI" className="field" />
                      </Field>
                      <Field label="Celular">
                        <input value={form.celular} onChange={(e) => update("celular", e.target.value)} placeholder="WhatsApp" className="field" />
                      </Field>
                    </div>

                    <Field label="Correo electrónico">
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="correo@ejemplo.com" className="field" />
                    </Field>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Experiencia">
                        <select value={form.experiencia} onChange={(e) => update("experiencia", e.target.value)} className="field">
                          <option value="">¿En qué nivel estás?</option>
                          <option>Estoy empezando</option>
                          <option>Ya vendo ocasionalmente</option>
                          <option>Quiero vender más</option>
                        </select>
                      </Field>
                      <Field label="Objetivo">
                        <select value={form.objetivo} onChange={(e) => update("objetivo", e.target.value)} className="field">
                          <option value="">¿Qué quieres lograr?</option>
                          <option>Vender por redes</option>
                          <option>Mejorar mi contenido</option>
                          <option>Conseguir más clientes</option>
                        </select>
                      </Field>
                    </div>

                    <label className="flex gap-3 rounded-lg border border-pink-100 bg-pink-50 p-3 text-xs leading-5 text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.acepta}
                        onChange={(e) => update("acepta", e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-[#e4147f]"
                      />
                      Autorizo a Rossy Resina a contactarme por WhatsApp o correo para coordinar mi inscripción al curso.
                    </label>

                    {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#e4147f] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_14px_32px_rgba(228,20,127,0.24)] transition hover:brightness-105 disabled:opacity-60"
                    >
                      {sending ? "Registrando..." : "Enviar registro"}
                      <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                    </button>
                  </form>
                </>
              )}
            </aside>
          </div>
        </section>
      </main>

      <style jsx>{`
        .field {
          width: 100%;
          height: 46px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: white;
        }
        .field:focus {
          border-color: #e4147f;
          box-shadow: 0 0 0 3px rgba(228, 20, 127, 0.12);
        }
        .course-landing {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          letter-spacing: 0;
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Benefit({ icon, title, text, plainIcon = false }: { icon: React.ReactNode; title: string; text: string; plainIcon?: boolean }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-[#f3b6d5] bg-white/95 p-4 shadow-[0_12px_30px_rgba(228,20,127,0.10)] ring-1 ring-white/70 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#e4147f] via-[#ff5ca8] to-[#f7b4d6]" />
      <div className="flex items-center gap-4">
        <div className={`rr-icon-float flex shrink-0 items-center justify-center ${plainIcon ? "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" : "h-11 w-11 rounded-full bg-[#e4147f] text-white shadow-[0_10px_22px_rgba(228,20,127,0.22)] sm:h-12 sm:w-12"}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-base font-black text-slate-950 md:text-lg">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700 md:text-base">{text}</p>
        </div>
      </div>
    </article>
  );
}

function InfoItem({ text }: { text: string }) {
  return (
    <p className="flex gap-2">
      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#e4147f]" />
      <span>{text}</span>
    </p>
  );
}
