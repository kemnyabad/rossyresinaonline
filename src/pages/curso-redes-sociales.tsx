import Head from "next/head";
import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  MegaphoneIcon,
  UserGroupIcon,
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

      <main className="course-landing min-h-screen bg-gradient-to-br from-[#ffd7ea] via-[#fff6fb] to-[#f7c8e2]">
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(228,20,127,0.14),transparent_24%),radial-gradient(circle_at_82%_28%,rgba(255,255,255,0.7),transparent_26%)]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-120px)] max-w-screen-2xl gap-8 px-4 pb-8 pt-4 md:grid-cols-[1fr_440px] md:px-8 md:pb-12 md:pt-6 lg:grid-cols-[1fr_500px]">
            <div className="flex min-w-0 flex-col justify-start">
              <div className="relative mx-auto aspect-[1962/331] w-full overflow-hidden rounded-lg bg-white/40 shadow-[0_20px_60px_rgba(228,20,127,0.14)] md:mx-0">
                <Image
                  src="/banners/curso-redes-sociales-web.png"
                  alt="Curso online vende por redes sociales"
                  fill
                  priority
                  className="object-contain"
                  sizes="(min-width: 1024px) 900px, 100vw"
                />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Benefit icon={<ChartBarIcon className="h-6 w-6" />} title="Más ventas" text="Aprende a convertir seguidores en clientes." />
                <Benefit icon={<MegaphoneIcon className="h-6 w-6" />} title="Contenido claro" text="Publicaciones que explican, atraen y venden." />
                <Benefit icon={<DevicePhoneMobileIcon className="h-6 w-6" />} title="Redes ordenadas" text="Facebook, Instagram y TikTok con estrategia." />
              </div>

              <div className="mt-8 rounded-xl border border-[#f5a4cd] bg-white/90 p-5 shadow-[0_18px_45px_rgba(228,20,127,0.14)] ring-1 ring-white/70">
                <p className="inline-flex rounded-full bg-[#e4147f] px-4 py-1.5 text-sm font-black uppercase tracking-wide text-white">Qué aprenderás</p>
                <div className="mt-4 grid gap-3 text-base font-semibold leading-7 text-slate-800 sm:grid-cols-2">
                  <InfoItem text="Cómo presentar tus artesanías para vender mejor." />
                  <InfoItem text="Ideas de contenido para productos personalizados." />
                  <InfoItem text="Cómo responder mensajes y cerrar pedidos." />
                  <InfoItem text="Cómo organizar una rutina simple de ventas." />
                </div>
              </div>
            </div>

            <aside className="relative self-center rounded-xl bg-white p-5 pt-10 shadow-[0_24px_70px_rgba(28,7,48,0.16)] md:p-7 md:pt-12">
              {sent ? (
                <div className="flex min-h-[520px] flex-col justify-center text-center">
                  <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" />
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
                    <div className="rr-cta-pulse absolute -top-3 left-1/2 inline-flex h-12 -translate-x-1/2 items-center gap-3 rounded-full border-[6px] border-white bg-[#ffd21f] pl-6 pr-2 text-base font-black uppercase tracking-wide text-black shadow-[0_12px_26px_rgba(17,24,39,0.14)]">
                      Inscríbete aquí
                      <span className="rr-icon-pop flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                        <FaHandPointer className="h-4 w-4 -rotate-12" />
                      </span>
                    </div>
                    <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950">Deja tus datos y separa tu cupo</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Curso online, viernes 5 de Junio, 6 PM. Inversión: S/20.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

                    <label className="flex gap-3 rounded-lg bg-pink-50 p-3 text-xs leading-5 text-slate-700">
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
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#e4147f] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_14px_32px_rgba(228,20,127,0.28)] transition hover:brightness-105 disabled:opacity-60"
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
          height: 44px;
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

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-[#f5a4cd] bg-white/95 p-5 shadow-[0_16px_38px_rgba(228,20,127,0.13)] ring-1 ring-white/70">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#e4147f] via-[#ff5ca8] to-[#f7b4d6]" />
      <div className="rr-icon-float flex h-12 w-12 items-center justify-center rounded-full bg-[#e4147f] text-white shadow-[0_10px_22px_rgba(228,20,127,0.28)]">{icon}</div>
      <p className="mt-4 text-lg font-black text-slate-950">{title}</p>
      <p className="mt-1 text-base leading-6 text-slate-700">{text}</p>
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
