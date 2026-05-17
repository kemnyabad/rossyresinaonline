import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import logo from "@/images/logo.jpg";
import {
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const whatsappUrl = "https://wa.me/51962507061";

const programs = [
  {
    image: "/products/resina-epoxica.png",
    type: "Programa de Estudios",
    title: "Resina epóxica para emprender",
    module: "Módulo: Preparación, pigmentación, moldes y acabados comerciales",
    description:
      "Fórmate en técnicas prácticas de resina epóxica para crear piezas artesanales con buena presentación, control de materiales y enfoque de venta.",
    learning: [
      "Preparación segura del área de trabajo",
      "Medición, mezcla y control de burbujas",
      "Uso de pigmentos, glitters e inclusiones",
      "Desmoldado, lijado y acabado final",
      "Costeo básico y precio de venta",
      "Armado de catálogo para redes sociales",
    ],
    schedule: ["Mañanas: sábados", "Hora: 9:00 a.m. - 12:00 p.m."],
  },
  {
    image: "/products/lapicero-shaker-corazon.avif",
    type: "Programa de Estudios",
    title: "Piezas shaker y detalles personalizados",
    module: "Módulo: Diseño de llaveros, lapiceros, dijes y piezas con movimiento",
    description:
      "Aprende a diseñar productos pequeños, coloridos y personalizables para regalos, ferias, pedidos por catálogo y venta por temporada.",
    learning: [
      "Selección correcta de moldes y accesorios",
      "Composición de color y decoración",
      "Sellado y acabado de piezas shaker",
      "Control de desperdicio de material",
      "Fotografía simple para publicar productos",
      "Presentación y empaque para entrega",
    ],
    schedule: ["Tardes: martes y jueves", "Hora: 3:00 p.m. - 5:00 p.m."],
  },
  {
    image: "/products/aretes-pendientes.avif",
    type: "Módulo de Estudios",
    title: "Bisutería artesanal en resina",
    module: "Módulo: Aretes, dijes, accesorios y colecciones pequeñas",
    description:
      "Desarrolla accesorios en resina con criterios de color, acabado, combinación de piezas y presentación para venta directa.",
    learning: [
      "Preparación de piezas livianas",
      "Aplicación de color, mica y efectos",
      "Perforado, armado y herrajes",
      "Acabados finos y control de calidad",
      "Colecciones por estilo o temporada",
      "Atención de pedidos personalizados",
    ],
    schedule: ["Noche: lunes y miércoles", "Hora: 6:30 p.m. - 8:30 p.m."],
  },
];

export default function EscuelaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSchoolLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !password) {
      setLoginError("Ingresa tu usuario y contraseña.");
      return;
    }
    if (!emailClean.includes("@")) {
      setLoginError("Usa el correo registrado como usuario.");
      return;
    }

    setLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        email: emailClean,
        password,
        redirect: false,
        callbackUrl: "/estudiante",
      });

      if (result?.error || !result?.ok) {
        setLoginError("Usuario o contraseña incorrectos.");
        return;
      }

      await router.push(result.url || "/estudiante");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Escuela Rossy Resina</title>
        <meta
          name="description"
          content="Escuela Rossy Resina. Programas y módulos de formación artesanal en resina para aprender, crear y emprender."
        />
      </Head>

      <main className="min-h-screen bg-[#f5f5f5] text-[#1f2933]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <Link href="/escuela" className="flex items-center gap-3">
              <Image src={logo} alt="Escuela Rossy Resina" width={86} height={86} className="rounded-full border border-pink-100" priority />
              <div>
                <p className="text-2xl font-bold text-[#c21885]">Rossy Resina</p>
                <p className="text-sm text-slate-600">Cursos especializados</p>
              </div>
            </Link>

            <form
              onSubmit={handleSchoolLogin}
              className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-[150px_150px_auto]"
            >
              {session?.user?.email ? (
                <div className="sm:col-span-3">
                  <p className="text-sm font-semibold text-slate-700">Sesión activa: {session.user.email}</p>
                  <Link href="/estudiante" className="mt-2 inline-flex h-9 items-center rounded bg-[#c21885] px-4 font-semibold text-white">
                    Ir a mi perfil estudiante
                  </Link>
                </div>
              ) : (
                <>
                  <input
                    className="h-9 rounded border border-slate-300 px-3 outline-none focus:border-[#c21885]"
                    placeholder="Usuario"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                  <input
                    className="h-9 rounded border border-slate-300 px-3 outline-none focus:border-[#c21885]"
                    placeholder="Contraseña"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    className="h-9 rounded bg-[#c21885] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    type="submit"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Ingresando..." : "Ingresar"}
                  </button>
                  <div className="text-xs sm:col-span-3">
                    {loginError ? <p className="mb-1 text-red-600">{loginError}</p> : null}
                    <Link className="text-[#c21885]" href="/sign-in?callbackUrl=/estudiante">
                      ¿Olvidaste tus datos o deseas matricularte?
                    </Link>
                  </div>
                </>
              )}
            </form>
          </div>
        </section>

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Menú principal">
              <Link href="/escuela" className="inline-flex items-center gap-2 rounded px-3 py-2 font-semibold text-[#c21885] hover:bg-pink-50">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <a href="#programas" className="rounded px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
                Programas
              </a>
              <a href="#virtuales" className="rounded px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
                Cursos virtuales
              </a>
              <a href="#admision" className="rounded px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
                Matrícula
              </a>
              <Link href="/" className="rounded px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
                Tienda
              </Link>
            </nav>

            <div className="relative w-full lg:w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="h-10 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#c21885]" placeholder="Search courses" />
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 py-5">
          <div className="relative min-h-[260px] overflow-hidden rounded bg-slate-900 md:min-h-[360px]">
            <Image src="/banners/moldes-buen-precio.png" alt="Banner de la escuela Rossy Resina" fill className="object-cover opacity-75" sizes="1200px" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" />
            <div className="relative z-10 max-w-2xl px-6 py-10 text-white md:px-10 md:py-16">
              <p className="text-sm font-bold uppercase tracking-wide text-pink-200">Matrícula abierta 2026 - I</p>
              <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                Formación técnica artesanal en resina
              </h1>
              <p className="mt-4 text-base leading-7 text-white/85">
                Programas modulares para aprender técnicas, producir piezas y emprender con productos hechos a mano.
              </p>
              <a href={whatsappUrl} className="mt-6 inline-flex items-center gap-2 rounded bg-[#25d366] px-5 py-3 text-sm font-bold text-white hover:brightness-95">
                <PhoneIcon className="h-5 w-5" />
                WhatsApp: informes e inscripciones
              </a>
            </div>
          </div>
        </section>

        <section id="programas" className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 border border-slate-200 bg-white px-5 py-10 text-center shadow-sm md:px-10">
            <a href={whatsappUrl} className="inline-flex rounded bg-[#22c55e] px-5 py-3 text-base font-bold text-white hover:brightness-95">
              WhatsApp: <span className="ml-1 font-medium">962507061</span>
            </a>

            <h2 className="mt-9 text-2xl font-medium text-slate-700">
              Centro de Educación Técnico Productivo - Rossy Resina
            </h2>
            <h3 className="mt-2 text-3xl font-bold leading-tight text-slate-700">
              Formación <span className="text-[#b00016]">Técnica</span> - en resina y emprendimiento artesanal
            </h3>
            <div className="mx-auto mt-5 h-[3px] w-16 bg-[#b00016]" />
            <p className="mt-5 text-sm font-medium text-slate-700">
              <span className="text-[#b00016]">→</span> Respaldado por la experiencia de Rossy Resina
            </p>
            <p className="mx-auto mt-7 max-w-5xl text-sm leading-6 text-slate-600">
              Somos una escuela artesanal dedicada a la formación técnico-productiva en resina. <strong>Ofrecemos capacitación práctica mediante programas modulares</strong> para aprender técnicas, crear productos personalizados y desarrollar un emprendimiento con horarios flexibles.
            </p>

            <h2 className="mt-9 text-3xl font-black text-[#b00016]">
              Matrícula abierta <span className="text-slate-700">2026 - I</span>
            </h2>
            <p className="mt-2 text-base text-slate-900">
              Programas y módulos de estudio disponibles para tu formación profesional
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <article key={program.title} className="bg-white">
                <div className="flex h-[190px] w-full items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#c21885] shadow-sm">
                      <BookOpenIcon className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-lg font-black text-slate-800">Próximamente</p>
                  </div>
                </div>

                <div className="px-3 pt-4">
                  <span className="inline-flex rounded-full bg-[#d4001a] px-3 py-1 text-[9px] font-bold text-white">
                    {program.type}
                  </span>
                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">{program.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-800">
                    <strong>Módulo:</strong> {program.module.replace(/^Módulo:\s*/i, "")}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{program.description}</p>

                  <h4 className="mt-5 text-sm font-black text-[#d4001a]">Lo que aprenderás</h4>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-5 text-slate-600">
                    {program.learning.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <div className="mt-5 space-y-1 text-sm leading-5 text-slate-700">
                    <p className="flex gap-2">
                      <CalendarDaysIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                      <span><strong>Inicio:</strong> 16 de marzo</span>
                    </p>
                    <p className="flex gap-2">
                      <CalendarDaysIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                      <span><strong>Término:</strong> 24 de julio</span>
                    </p>
                    <p className="flex gap-2">
                      <BookOpenIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                      <span><strong>Certificación:</strong> Modular</span>
                    </p>
                    <p className="flex gap-2">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                      <span><strong>Modalidad:</strong> Presencial y online</span>
                    </p>
                    <p className="flex gap-2">
                      <AcademicCapIcon className="h-4 w-4 shrink-0 text-[#d4001a]" />
                      <span><strong>Dirigido a:</strong> Público en general</span>
                    </p>
                    <p className="flex gap-2">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#d4001a]">$</span>
                      <span><strong>Inversión:</strong> S/ 50 mensual</span>
                    </p>
                  </div>

                  <div className="mt-5 border-l-4 border-[#d4001a] bg-[#ffdf69] px-4 py-3 text-sm leading-5 text-slate-800">
                    <p className="font-black text-[#d4001a]">Horarios disponibles</p>
                    {program.schedule.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-center">
                    <a href={whatsappUrl} className="inline-flex items-center gap-2 rounded-full bg-[#0aaa35] px-5 py-2.5 text-xs font-black text-white hover:brightness-95">
                      <PhoneIcon className="h-4 w-4" />
                      Informes e inscripciones
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="virtuales" className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Explora nuestros cursos virtuales</h2>
            <p className="mt-2 text-slate-700">
              Capacítate desde cualquier lugar, a tu ritmo y con acompañamiento especializado en resina, moldes, pigmentos y venta artesanal.
            </p>
            <a href="#programas" className="mt-5 inline-flex rounded bg-slate-900 px-5 py-3 text-sm font-bold text-white">
              Acceder a revisar nuestros cursos virtuales
            </a>
          </div>
        </section>

        <section id="admision" className="mx-auto max-w-6xl px-4 pb-10">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Matrícula abierta para público en general",
              "Certificación modular por programa",
              "Clases prácticas con enfoque de emprendimiento",
            ].map((item) => (
              <div key={item} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircleIcon className="h-7 w-7 text-[#c21885]" />
                <p className="mt-3 font-bold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm text-slate-600 md:grid-cols-4">
            <div>
              <p className="font-bold text-slate-900">Escuela Rossy Resina</p>
              <p className="mt-2">Formación artesanal en resina.</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">Programas</p>
              <p className="mt-2">Resina epóxica</p>
              <p>Shakers y personalizados</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">Informes</p>
              <p className="mt-2">WhatsApp: 962 507 061</p>
              <p>Lima, Perú</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">Accesos</p>
              <Link href="/" className="mt-2 block text-[#c21885]">Tienda Rossy Resina</Link>
              <a href="#programas" className="block text-[#c21885]">Cursos y módulos</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
