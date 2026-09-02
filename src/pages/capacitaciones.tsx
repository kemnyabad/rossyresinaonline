import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type PublicFecha = {
  id: string;
  fecha: string;
  cuposRestantes: number;
};

type PublicCurso = {
  id: string;
  nombre: string;
  nivel: string;
  descripcion: string;
  modalidad: string;
  ciudad: string;
  sede: string;
  duracionHoras: number;
  precio: number;
  precioAnterior: number | null;
  cupoMax: number;
  imagen: string;
  fechas: PublicFecha[];
};

type Props = {
  cursos: PublicCurso[];
};

const whatsappUrl = "https://wa.me/51962507061";

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", timeZone: "America/Lima" });

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });

export default function CapacitacionesPage({ cursos }: Props) {
  const [activeFecha, setActiveFecha] = useState<{ curso: PublicCurso; fecha: PublicFecha } | null>(null);
  const [cuposOverride, setCuposOverride] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", notas: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const openForm = (curso: PublicCurso, fecha: PublicFecha) => {
    setActiveFecha({ curso, fecha });
    setForm({ nombre: "", email: "", telefono: "", notas: "" });
    setError("");
    setSent(false);
  };

  const closeForm = () => setActiveFecha(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeFecha) return;
    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) {
      setError("Completa tu nombre, correo y teléfono.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/talleres/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaId: activeFecha.fecha.id, ...form }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error || "No se pudo registrar tu inscripción.");
        return;
      }
      setSent(true);
      setCuposOverride((prev) => ({
        ...prev,
        [activeFecha.fecha.id]: Math.max(0, activeFecha.fecha.cuposRestantes - 1),
      }));
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const cuposDe = (fecha: PublicFecha) => cuposOverride[fecha.id] ?? fecha.cuposRestantes;

  return (
    <>
      <Head>
        <title>Cursos y talleres | Escuela Rossy Resina</title>
        <meta
          name="description"
          content="Cursos y talleres de resina con cupos disponibles. Elige una fecha y regístrate en minutos."
        />
      </Head>

      <main className="min-h-screen bg-[#f5f5f5] text-[#1f2933]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-sm font-semibold text-[#c21885] hover:underline">
              ← Volver a inicio
            </Link>
            <a href={whatsappUrl} className="inline-flex items-center gap-2 rounded bg-[#25d366] px-4 py-2 text-sm font-bold text-white hover:brightness-95">
              <PhoneIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-sm font-bold uppercase tracking-wide text-[#c21885]">Escuela Rossy Resina</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
            Cursos y talleres con cupos disponibles
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Elige el curso, escoge una fecha y regístrate directamente. Te contactaremos para confirmar tu cupo.
          </p>

          {cursos.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              <AcademicCapIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm">
                Por ahora no hay fechas de cursos disponibles. Escríbenos por WhatsApp para más información.
              </p>
              <a href={whatsappUrl} className="mt-4 inline-flex rounded bg-[#25d366] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95">
                Escribir por WhatsApp
              </a>
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              {cursos.map((curso) => (
                <article key={curso.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="grid lg:grid-cols-[200px_1fr_270px]">
                    <div className="relative flex h-40 items-center justify-center bg-slate-100 lg:h-full">
                      {curso.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={curso.imagen} alt={curso.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <AcademicCapIcon className="h-12 w-12 text-slate-300" />
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#3730a3]">
                          {curso.modalidad}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          Nivel {curso.nivel}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-black text-slate-950">{curso.nombre}</h2>
                      {curso.descripcion ? (
                        <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{curso.descripcion}</p>
                      ) : null}

                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                          Duración: {curso.duracionHoras} h
                        </p>
                        {(curso.ciudad || curso.sede) && (
                          <p className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                            {[curso.ciudad, curso.sede].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200 p-4 lg:border-l lg:border-t-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-red-600">S/ {curso.precio.toFixed(2)}</span>
                        {curso.precioAnterior ? (
                          <span className="text-sm text-slate-400 line-through">S/ {curso.precioAnterior.toFixed(2)}</span>
                        ) : null}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <CalendarDaysIcon className="h-4 w-4" />
                          Fechas disponibles
                        </p>
                        <div className="flex flex-col gap-2.5">
                          {curso.fechas.map((fecha) => {
                            const cupos = cuposDe(fecha);
                            const lleno = cupos <= 0;
                            return (
                              <button
                                key={fecha.id}
                                type="button"
                                disabled={lleno}
                                onClick={() => openForm(curso, fecha)}
                                className={`font-bodyFont w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                                  lleno
                                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                    : "border-[#c21885]/30 bg-[#fdf2fa] text-[#c21885] hover:border-[#c21885] hover:bg-[#c21885] hover:text-white"
                                }`}
                              >
                                <span className="block text-base font-bold capitalize leading-tight">
                                  {fmtFecha(fecha.fecha)}
                                </span>
                                <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
                                  <span className="inline-flex items-center gap-1.5">
                                    <ClockIcon className="h-4 w-4 shrink-0" />
                                    {fmtHora(fecha.fecha)}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <UserGroupIcon className="h-4 w-4 shrink-0" />
                                    {lleno ? "Sin cupo" : `${cupos} cupos`}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {activeFecha && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => event.target === event.currentTarget && closeForm()}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <p className="font-bold text-slate-900">Reservar cupo</p>
              <button onClick={closeForm} className="rounded-lg p-1.5 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-5">
              {sent ? (
                <div className="text-center">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
                  <h3 className="mt-3 text-lg font-bold text-emerald-800">¡Inscripción recibida!</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Te contactaremos por WhatsApp o correo para confirmar tu cupo en{" "}
                    <strong>{activeFecha.curso.nombre}</strong> el {fmtFecha(activeFecha.fecha.fecha)}.
                  </p>
                  <button
                    onClick={closeForm}
                    className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-3">
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{activeFecha.curso.nombre}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                      <span className="capitalize">{fmtFecha(activeFecha.fecha.fecha)}</span> · {fmtHora(activeFecha.fecha.fecha)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <UserGroupIcon className="h-3.5 w-3.5" />
                      {cuposDe(activeFecha.fecha)} cupos disponibles
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Nombre completo *</label>
                    <input
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#c21885]"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Correo electrónico *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#c21885]"
                      placeholder="tu@correo.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">WhatsApp / Teléfono *</label>
                    <input
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#c21885]"
                      placeholder="999 999 999"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Mensaje adicional (opcional)</label>
                    <textarea
                      value={form.notas}
                      onChange={(e) => setForm({ ...form, notas: e.target.value })}
                      className="mt-1 min-h-[70px] w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#c21885]"
                      placeholder="¿Alguna pregunta o preferencia?"
                    />
                  </div>

                  {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={sending}
                    className="h-11 rounded-lg bg-[#c21885] text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
                  >
                    {sending ? "Enviando..." : "Reservar mi cupo"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const rows: any[] = await (prisma as any).curso.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      fechas: {
        orderBy: { fecha: "asc" },
        include: { inscripciones: { select: { id: true } } },
      },
    },
  });

  const now = Date.now();
  const cursos: PublicCurso[] = rows
    .map((c) => {
      const fechas: PublicFecha[] = (c.fechas || [])
        .filter((f: any) => new Date(f.fecha).getTime() > now)
        .map((f: any) => ({
          id: f.id,
          fecha: f.fecha.toISOString(),
          cuposRestantes: Math.max(0, Number(c.cupoMax || 0) - (f.inscripciones?.length || 0)),
        }));
      return {
        id: c.id,
        nombre: c.nombre,
        nivel: c.nivel,
        descripcion: c.descripcion,
        modalidad: c.modalidad,
        ciudad: c.ciudad,
        sede: c.sede,
        duracionHoras: c.duracionHoras,
        precio: Number(c.precio || 0),
        precioAnterior: c.precioAnterior != null ? Number(c.precioAnterior) : null,
        cupoMax: c.cupoMax,
        imagen: c.imagen || "",
        fechas,
      };
    })
    .filter((c) => c.fechas.length > 0);

  return { props: { cursos } };
};
