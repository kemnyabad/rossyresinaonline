import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { videos } from "@/data/capacitaciones";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const subscriberComments = [
  { id: "rossy-fan-01", name: "Camila R.", date: "hace 1 semana", text: "La mezcla quedo perfecta con estos tips." },
  { id: "rossy-fan-02", name: "Luis A.", date: "hace 3 semanas", text: "Quisiera un video de pulido espejo mas avanzado." },
  { id: "rossy-fan-01", name: "Rita P.", date: "hace 2 dias", text: "Me ayudo mucho con el desmolde, gracias." },
];

const recentComments = [
  { id: "rossy-fan-01", name: "Diana G.", date: "hace 1 dia", text: "Excelente explicacion, voy a practicar hoy." },
  { id: "rossy-fan-02", name: "Marta L.", date: "hace 4 dias", text: "Muy claro el paso a paso, gracias Rossy." },
];

export default function CapacitacionDetailPage() {
  const router = useRouter();
  const id = String(router.query.id || "");
  const video = videos.find((v) => v.id === id) || videos[0];
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
        <title>{video.title} | Rossy Resina Studio</title>
        <meta name="description" content={video.desc} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Space+Grotesk:wght@400;600&display=swap"
          rel="stylesheet"
        />
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

            <div className="flex-1 min-w-[220px]" />

            <div className="flex items-center gap-3 text-sm">
              <Link href="/capacitaciones" className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50">
                Volver
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

        <div className="mx-auto max-w-screen-2xl px-5 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <main className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="relative w-full aspect-video bg-black">
                <img src={video.thumb} alt={video.title} className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="h-16 w-16 rounded-full bg-white/90 text-gray-900 text-2xl font-semibold">
                    ▶
                  </button>
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[11px] text-white">
                  {video.duration}
                </span>
              </div>
              <div className="p-5">
                <h1 className="text-xl md:text-2xl font-semibold">{video.title}</h1>
                <p className="text-sm text-gray-600 mt-2">{video.desc}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>{video.views} vistas</span>
                  <span>-</span>
                  <span>{video.date}</span>
                  <span>-</span>
                  <span>{video.tag}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {["Me gusta", "Compartir", "Guardar", "Reportar"].map((a) => (
                    <button key={a} className="px-3 py-1 rounded-full border border-gray-300 text-xs hover:bg-gray-50">
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Comentarios</h2>
              <div className="mt-4 flex gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold">
                  RR
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                    placeholder="Escribe tu comentario..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button className="px-4 py-2 rounded-full bg-pink-600 text-white text-xs font-semibold">
                      Publicar
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {recentComments.map((c) => (
                  <div key={`${c.name}-${c.date}`} className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/suscriptores/${c.id}`}
                        className="text-sm font-semibold text-gray-900 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <p className="text-xs text-gray-500">{c.date}</p>
                      <p className="text-sm text-gray-700 mt-1">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold">Comentarios de otros suscriptores</h3>
              <div className="mt-4 grid gap-4">
                {subscriberComments.map((c) => (
                  <div key={`${c.name}-${c.date}`} className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-semibold">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/suscriptores/${c.id}`}
                        className="text-sm font-semibold text-gray-900 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <p className="text-xs text-gray-500">{c.date}</p>
                      <p className="text-sm text-gray-700 mt-1">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Siguiente</p>
              <div className="mt-3 grid gap-3">
                {videos.map((v) => (
                  <Link key={`side-${v.id}`} href={`/capacitaciones/${v.id}`} className="flex gap-3">
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
          </aside>
        </div>
      </div>
    </>
  );
}
