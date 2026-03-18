import Head from "next/head";
import Link from "next/link";
import { videos } from "@/data/capacitaciones";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CapacitacionesPage() {
  const { data: session } = useSession();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/capacitaciones/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfileId(data?.id || null))
      .catch(() => setProfileId(null));
  }, [session?.user?.email]);

  return (
    <>
      <Head>
        <title>Rossy Resina Studio | Capacitaciones</title>
        <meta
          name="description"
          content="Capacitaciones de Rossy Resina: tutoriales estilo YouTube para resina, moldes, pigmentos y acabados."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Space+Grotesk:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @keyframes riseIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fce7f3,_#f8fafc_50%,_#e2e8f0_100%)] text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-screen-2xl px-5 py-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white border border-pink-200 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Rossy Resina" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-pink-600" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Rossy Resina
                </p>
                <p className="text-xs text-gray-500">Studio de capacitaciones</p>
              </div>
            </div>

            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm">
                <input
                  placeholder="Buscar capacitaciones..."
                  className="w-full text-sm outline-none bg-transparent"
                />
                <button className="ml-2 rounded-full bg-pink-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Buscar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Link href="/" className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50">
                Tienda
              </Link>
              {profileId && (
                <Link
                  href={`/suscriptores/${profileId}`}
                  className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  Mi perfil
                </Link>
              )}
              <Link href="/suscripcion" className="px-3 py-1 rounded-full bg-gray-900 text-white">
                Suscribirse
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-screen-2xl px-5 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 h-fit">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Explorar</p>
            <ul className="mt-3 grid gap-2 text-sm">
              <li className="px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">Inicio</li>
              <li>
                <Link href="/comunidad" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                  Comunidad
                </Link>
              </li>
              {["Resina epoxica", "Moldes", "Pigmentos", "Ecoresina", "Acabados"].map((it) => (
                <li key={it} className="px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  {it}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white p-4">
              <p className="text-sm font-semibold">Nueva serie</p>
              <p className="text-xs opacity-90">Resina UV en 7 pasos</p>
              <button className="mt-3 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                Ver ahora
              </button>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="relative h-64 md:h-80">
                  <img src="/sliderImg_3.svg" alt="Video destacado" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-pink-200">Video destacado</p>
                    <h1 className="text-2xl md:text-3xl font-semibold mt-2" style={{ fontFamily: '"Oswald", sans-serif' }}>
                      Masterclass: Resina epoxica cristalina
                    </h1>
                    <p className="text-sm mt-2 max-w-xl">
                      Aprende desde la mezcla hasta el pulido final, con tips reales de taller.
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-white/20 px-3 py-1">34:12</span>
                      <span>8.2K vistas</span>
                      <span>hace 3 dias</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Siguiente</p>
                  <div className="mt-3 grid gap-3">
                    {videos.slice(0, 4).map((v) => (
                      <Link key={`next-${v.id}`} href={`/capacitaciones/${v.id}`} className="flex gap-3">
                        <div className="relative h-16 w-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={v.thumb} alt={v.title} className="h-full w-full object-cover" />
                          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 text-[10px] text-white">
                            {v.duration}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2">{v.title}</p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Rossy Resina - {v.views} vistas
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Todas las capacitaciones
                </h2>
                <div className="flex flex-wrap gap-2">
                  {["Todo", "Basico", "Intermedio", "Avanzado"].map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 rounded-full border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.map((v, idx) => (
                  <Link
                    key={v.id}
                    href={`/capacitaciones/${v.id}`}
                    className="group rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    style={{ animation: `riseIn .45s ease ${idx * 0.06}s both` }}
                  >
                    <div className="relative h-40 bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-transparent to-pink-300/30" />
                      <img src={v.thumb} alt={v.title} className="h-full w-full object-cover" />
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {v.duration}
                      </div>
                      <div className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
                        {v.level}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{v.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{v.desc}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-pink-500" />
                          Rossy Resina
                        </span>
                        <span>-</span>
                        <span>{v.views} vistas</span>
                        <span>-</span>
                        <span>{v.date}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-pink-600 font-semibold">
                          {v.tag}
                        </span>
                        <span className="text-xs font-semibold text-pink-600 hover:underline">Ver video</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
