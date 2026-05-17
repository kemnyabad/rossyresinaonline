import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { signOut } from "next-auth/react";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  IdentificationIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import prisma from "@/lib/prisma";
import { ensureSubscriberProfile } from "@/lib/capacitaciones";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const cleanEducationText = (value: string) =>
  String(value || "")
    .replace(/ep[?�]xica/gi, "epoxica")
    .replace(/B[?�]sico/gi, "Basico")
    .replace(/inscripci[?�]n/gi, "inscripcion")
    .replace(/validaci[?�]n/gi, "validacion")
    .replace(/revisi[?�]n/gi, "revision");

const defaultPaymentSummary = {
  plan: "Curso mensual",
  monthlyAmount: "S/ 50 mensual",
  enrollmentStatus: "Pendiente de asignación",
  paymentStatus: "Pendiente de verificación administrativa",
  nextPayment: "Por confirmar",
  lastPayment: "Aún no hay pagos registrados",
};

interface StudentPageProps {
  student: {
    id: string;
    name: string;
    email: string;
    profileId: string;
    handle: string;
    displayName: string;
    bio: string;
    location: string;
    joined: string;
    status: string;
  };
  capacitaciones: Array<{
    id: string;
    curso: string;
    nivel: string;
    estado: string;
    fechaProgramada: string | null;
  }>;
  talleres: Array<{
    id: string;
    nombre: string;
    curso: string;
    modalidad: string;
    fecha: string;
    sede: string;
  }>;
  paymentSummary?: {
    plan: string;
    monthlyAmount: string;
    enrollmentStatus: string;
    paymentStatus: string;
    nextPayment: string;
    lastPayment: string;
  };
}

export default function StudentProfilePage({ student, capacitaciones, talleres, paymentSummary }: StudentPageProps) {
  const billing = paymentSummary || defaultPaymentSummary;
  const joinedDate = new Date(student.joined).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const activeItems = capacitaciones.length + talleres.length;

  return (
    <>
      <Head>
        <title>Perfil estudiante - Escuela Rossy Resina</title>
        <meta name="description" content="Panel de estudiante de Escuela Rossy Resina." />
      </Head>

      <main className="student-campus min-h-screen bg-[#f6f7f9] text-slate-900">
        <style jsx global>{`
          .student-campus {
            --text-primary: #111827;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --accent: #c21885;
            font-size: 16px;
            line-height: 1.5;
            letter-spacing: 0;
          }
        `}</style>

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#b00016]">Campus virtual</p>
              <h1 className="mt-1 text-[32px] font-semibold leading-tight tracking-normal text-slate-950 md:text-4xl">Perfil estudiante</h1>
              <p className="mt-1 text-[15px] font-normal leading-6 text-slate-500">Escuela Rossy Resina</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/escuela" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50">
                Volver a Escuela
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/escuela" })}
                className="rounded-md bg-slate-900 px-4 py-2 text-[14px] font-medium text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#c21885] text-[30px] font-semibold tracking-normal text-white">
                  {student.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[20px] font-semibold leading-7 tracking-normal text-slate-950">{student.displayName}</p>
                  <p className="truncate text-[14px] font-normal leading-5 text-slate-500">{student.email}</p>
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                    {student.status === "ACTIVO" ? "Alumno activo" : "Alumno desactivado"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-[14px] leading-6 text-slate-700">
                <InfoLine icon={<IdentificationIcon className="h-5 w-5" />} label="Código" value={student.handle} />
                <InfoLine icon={<MapPinIcon className="h-5 w-5" />} label="Ubicación" value={student.location || "Perú"} />
                <InfoLine icon={<CalendarDaysIcon className="h-5 w-5" />} label="Inscripción" value={joinedDate} />
              </div>

              <Link
                href={`/suscriptores/${student.profileId}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#c21885] px-4 py-3 text-[14px] font-semibold text-white"
              >
                Editar portafolio
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </section>

            <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-[19px] font-semibold leading-7 tracking-normal text-slate-950">Resumen académico</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric value={String(activeItems)} label="Cursos" />
                <Metric value="S/ 50" label="Mensual" />
                <Metric value="2026-I" label="Periodo" />
                <Metric value="Modular" label="Certificación" />
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#b00016]">Bienvenida/o</p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[1.15] tracking-normal text-slate-950">Hola, {student.displayName}</h2>
              <p className="mt-3 max-w-2xl text-[15px] font-normal leading-7 text-slate-600">
                Este es tu espacio de estudiante. Aquí verás tus cursos, horarios, estado de matrícula y acceso a tu portafolio de creaciones.
              </p>
            </div>

            <AcademicSection title="Mis programas de estudio">
              {capacitaciones.length === 0 && talleres.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {capacitaciones.map((item) => (
                    <CourseCard
                      key={item.id}
                      title={item.curso}
                      subtitle={`Nivel: ${item.nivel}`}
                      status={item.estado}
                      date={item.fechaProgramada}
                      mode="Capacitación"
                    />
                  ))}
                  {talleres.map((item) => (
                    <CourseCard
                      key={item.id}
                      title={item.curso}
                      subtitle={`${item.modalidad}${item.sede ? ` - ${item.sede}` : ""}`}
                      status="INSCRITO"
                      date={item.fecha}
                      mode="Taller"
                    />
                  ))}
                </>
              )}
            </AcademicSection>

            <AcademicSection title="Estado de matrícula y pagos">
              <div className="rounded border border-pink-100 bg-pink-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#b00016]">Información privada del alumno</p>
                    <h3 className="mt-1 text-[20px] font-semibold leading-7 tracking-normal text-slate-950">{billing.plan}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Estos datos solo se muestran dentro del campus virtual. No aparecen en tu portafolio público.
                    </p>
                  </div>
                  <div className="rounded bg-white px-5 py-4 text-center shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Inversión</p>
                    <p className="mt-1 text-[24px] font-semibold leading-8 tracking-normal text-[#c21885]">{billing.monthlyAmount}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <PaymentInfoCard
                  icon={<ShieldCheckIcon className="h-6 w-6" />}
                  label="Estado de matrícula"
                  value={billing.enrollmentStatus}
                />
                <PaymentInfoCard
                  icon={<BanknotesIcon className="h-6 w-6" />}
                  label="Estado de pago"
                  value={billing.paymentStatus}
                />
                <PaymentInfoCard
                  icon={<CalendarDaysIcon className="h-6 w-6" />}
                  label="Próximo pago"
                  value={billing.nextPayment}
                />
                <PaymentInfoCard
                  icon={<ClockIcon className="h-6 w-6" />}
                  label="Último registro"
                  value={billing.lastPayment}
                />
              </div>
            </AcademicSection>

            <AcademicSection title="Próximos pasos">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  "Confirma tus horarios por WhatsApp.",
                  "Prepara tus materiales antes de la primera clase.",
                  "Sube tus avances en tu portafolio de estudiante.",
                ].map((item) => (
                  <div key={item} className="rounded border border-slate-200 bg-slate-50 p-4">
                    <CheckCircleIcon className="h-6 w-6 text-[#c21885]" />
                    <p className="mt-3 text-[14px] font-medium leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </AcademicSection>
          </section>
        </div>
      </main>
    </>
  );
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-[#c21885]">{icon}</span>
      <span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="block text-[14px] font-medium leading-6 text-slate-800">{value}</span>
      </span>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded bg-slate-50 p-3 text-center">
      <p className="text-[22px] font-semibold leading-7 tracking-normal text-[#c21885]">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}

function AcademicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-[24px] font-semibold leading-8 tracking-normal text-slate-950 md:text-[26px]">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function PaymentInfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded border border-slate-200 bg-white p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-slate-50 text-[#c21885]">
        {icon}
      </span>
      <span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block text-[14px] font-medium leading-6 text-slate-900">{value}</span>
      </span>
    </div>
  );
}

function CourseCard({
  title,
  subtitle,
  status,
  date,
  mode,
}: {
  title: string;
  subtitle: string;
  status: string;
  date: string | null;
  mode: string;
}) {
  const dateText = date
    ? new Date(date).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
    : "Fecha por confirmar";

  return (
    <article className="rounded border border-slate-200 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#b00016]">{mode}</p>
          <h3 className="mt-1 text-[18px] font-semibold leading-7 tracking-normal text-slate-950">{title}</h3>
          <p className="mt-1 text-[14px] font-normal leading-6 text-slate-600">{subtitle}</p>
          <p className="mt-3 flex items-center gap-2 text-[14px] font-normal leading-6 text-slate-600">
            <ClockIcon className="h-4 w-4 text-[#c21885]" />
            {dateText}
          </p>
        </div>
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-100">
          {status}
        </span>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <AcademicCapIcon className="mx-auto h-10 w-10 text-slate-400" />
      <h3 className="mt-3 text-[18px] font-semibold leading-7 tracking-normal text-slate-950">Todavía no tienes cursos asignados</h3>
      <p className="mt-2 text-[14px] font-normal leading-6 text-slate-600">
        Cuando completemos tu inscripción, tus programas aparecerán aquí.
      </p>
      <Link href="/escuela#programas" className="mt-4 inline-flex rounded-md bg-[#c21885] px-4 py-2 text-[14px] font-semibold text-white">
        Ver programas
      </Link>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = (await getServerSession(ctx.req, ctx.res, authOptions as any)) as any;
  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/escuela",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: String(session.user.email).toLowerCase() },
  });
  if (!user || user.role === "ADMIN") {
    return {
      redirect: {
        destination: "/escuela",
        permanent: false,
      },
    };
  }

  const profile = await ensureSubscriberProfile({ userId: user.id, name: user.name, email: user.email });
  const [capacitaciones, talleres] = await Promise.all([
    prisma.capacitacionInscripcion.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tallerInscripcion.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      include: {
        cursoFecha: {
          include: {
            curso: true,
          },
        },
      },
    }),
  ]);
  const activeItems = capacitaciones.length + talleres.length;

  return {
    props: {
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileId: profile.id,
        handle: profile.handle,
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        joined: profile.joined.toISOString(),
        status: profile.status,
      },
      capacitaciones: capacitaciones.map((item) => ({
        id: item.id,
        curso: cleanEducationText(item.curso),
        nivel: cleanEducationText(item.nivel),
        estado: item.estado,
        fechaProgramada: item.fechaProgramada ? item.fechaProgramada.toISOString() : null,
      })),
      talleres: talleres.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        curso: cleanEducationText(item.cursoFecha?.curso?.nombre || "Taller"),
        modalidad: cleanEducationText(item.cursoFecha?.curso?.modalidad || "Presencial"),
        fecha: item.cursoFecha?.fecha?.toISOString() || "",
        sede: item.cursoFecha?.curso?.sede || "",
      })),
      paymentSummary: {
        plan: "Curso mensual",
        monthlyAmount: "S/ 50 mensual",
        enrollmentStatus: activeItems > 0 ? "Matrícula activa" : "Pendiente de asignación",
        paymentStatus: activeItems > 0 ? "Pendiente de verificación administrativa" : "Sin curso asignado",
        nextPayment: "Por confirmar",
        lastPayment: "Aún no hay pagos registrados",
      },
    },
  };
};
