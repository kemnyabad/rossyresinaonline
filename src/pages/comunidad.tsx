import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import prisma from "@/lib/prisma";

type FeedItem = {
  id: string;
  title: string;
  cover: string;
  type: "FOTO" | "VIDEO";
  createdAt: string;
  profile: {
    id: string;
    displayName: string;
    handle: string;
    avatar: string;
  };
};

type ComunidadProps = {
  feed: FeedItem[];
};

export default function ComunidadPage({ feed }: ComunidadProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const artists = useMemo(() => {
    const grouped = new Map<string, { id: string; displayName: string; handle: string; avatar: string; posts: number }>();
    feed.forEach((item) => {
      const found = grouped.get(item.profile.id);
      if (found) {
        found.posts += 1;
      } else {
        grouped.set(item.profile.id, {
          id: item.profile.id,
          displayName: item.profile.displayName,
          handle: item.profile.handle,
          avatar: item.profile.avatar,
          posts: 1,
        });
      }
    });
    return Array.from(grouped.values()).sort((a, b) => b.posts - a.posts);
  }, [feed]);

  return (
    <>
      <Head>
        <title>Comunidad | Rossy Resina</title>
        <meta
          name="description"
          content="Comunidad resinera estilo red social para compartir creaciones e interactuar entre artistas."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[#f0f2f5] text-[#1c1e21]" style={{ fontFamily: '"Manrope", sans-serif' }}>
        <header className="sticky top-0 z-40 border-b border-[#d9dde3] bg-[#1877f2]">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-white/50 bg-white">
                <img src="/logo.png" alt="Rossy Resina" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.2em] text-white" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Comunidad
                </p>
                <p className="truncate text-xs text-white/80">Artistas resineros conectados</p>
              </div>
            </div>

            <div className="hidden flex-1 justify-center px-8 md:flex">
              <input
                placeholder="Buscar artistas, moldes o t?cnicas..."
                className="w-full max-w-[520px] rounded-full border border-white/30 bg-white px-4 py-2 text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Link href="/capacitaciones" className="rounded-full bg-white/20 px-3 py-1.5 font-semibold text-white hover:bg-white/30">
                Capacitaciones
              </Link>
              <Link href="/suscripcion" className="rounded-full bg-[#0f5fd6] px-3 py-1.5 font-semibold text-white hover:bg-[#0c53bd]">
                Suscripci?n
              </Link>
              {session?.user?.email && (
                <span className="rounded-full bg-white/20 px-3 py-1.5 font-semibold text-white">
                  En linea
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
          <aside className="h-fit rounded-2xl border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">Menu</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/comunidad" className="rounded-xl bg-[#e7f3ff] px-3 py-2 font-semibold text-[#1877f2]">
                Comunidad
              </Link>
              <Link href="/capacitaciones" className="rounded-xl px-3 py-2 hover:bg-[#f3f4f6]">
                Videos y talleres
              </Link>
              <Link href="/suscripcion" className="rounded-xl px-3 py-2 hover:bg-[#f3f4f6]">
                Plan mensual
              </Link>
            </div>

            <div className="mt-5 rounded-xl bg-gradient-to-br from-[#1877f2] to-[#0e5bd7] p-4 text-white">
              <p className="text-sm font-semibold">Reto semanal</p>
              <p className="mt-1 text-xs text-white/90">
                Publica una pieza con acabado marmol y comenta el trabajo de otra artista.
              </p>
            </div>
          </aside>

          <main className="space-y-4">
            <section className="rounded-2xl border border-[#d9dde3] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full border border-[#d9dde3] bg-white">
                  <img src="/logo.png" alt="Tu perfil" className="h-full w-full object-cover" />
                </div>
                <button className="w-full rounded-full bg-[#f0f2f5] px-4 py-3 text-left text-sm text-[#65676b]">
                  Que estas creando hoy, resinera?
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#eef0f3] pt-3 text-sm font-semibold text-[#65676b]">
                <button className="rounded-lg py-2 hover:bg-[#f4f6f8]">Video en vivo</button>
                <button className="rounded-lg py-2 hover:bg-[#f4f6f8]">Foto/video</button>
                <button className="rounded-lg py-2 hover:bg-[#f4f6f8]">Crear historia</button>
              </div>
            </section>

            {feed.length === 0 ? (
              <section className="rounded-2xl border border-[#d9dde3] bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-semibold" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  No hay publicaciones a?n
                </h2>
                <p className="mt-2 text-sm text-[#65676b]">
                  Cuando los artistas publiquen sus creaciones, apareceran aqu?.
                </p>
              </section>
            ) : (
              feed.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d9dde3] bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <Link href={`/suscriptores/${item.profile.id}`} className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full border border-[#d9dde3]">
                        <img src={item.profile.avatar || "/logo.png"} alt={item.profile.displayName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1d2129]">{item.profile.displayName}</p>
                        <p className="text-xs text-[#65676b]">
                          @{item.profile.handle}  {new Date(item.createdAt).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                    </Link>
                    <span className="rounded-full bg-[#f0f2f5] px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
                      {item.type}
                    </span>
                  </div>

                  <div className="border-t border-b border-[#edf0f2] bg-[#f5f7fa]">
                    {item.type === "VIDEO" ? (
                      <video src={item.cover} className="h-[470px] w-full object-cover" controls preload="metadata" />
                    ) : (
                      <img src={item.cover} alt={item.title} className="h-[470px] w-full object-cover" />
                    )}
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-[#1d2129]">{item.title}</p>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#edf0f2] pt-3 text-sm">
                      <button
                        type="button"
                        onClick={() => setLiked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className={`rounded-lg py-2 font-semibold ${
                          liked[item.id] ? "bg-[#e8f3ff] text-[#1877f2]" : "bg-[#f0f2f5] text-[#65676b]"
                        }`}
                      >
                        {liked[item.id] ? "Te gusta" : "Me gusta"}
                      </button>
                      <button className="rounded-lg bg-[#f0f2f5] py-2 font-semibold text-[#65676b]">
                        Comentar
                      </button>
                      <Link href={`/suscriptores/${item.profile.id}`} className="rounded-lg bg-[#f0f2f5] py-2 text-center font-semibold text-[#65676b]">
                        Ver perfil
                      </Link>
                    </div>

                    <div className="mt-3 rounded-xl bg-[#f7f8fa] p-3">
                      <div className="space-y-2">
                        {(comments[item.id] || []).map((comment, idx) => (
                          <p key={`${item.id}-comment-${idx}`} className="text-xs text-[#374151]">
                            {comment}
                          </p>
                        ))}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={drafts[item.id] || ""}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Escribe un comentario..."
                          className="w-full rounded-lg border border-[#d9dde3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1877f2]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const value = String(drafts[item.id] || "").trim();
                            if (!value) return;
                            setComments((prev) => ({ ...prev, [item.id]: [...(prev[item.id] || []), value] }));
                            setDrafts((prev) => ({ ...prev, [item.id]: "" }));
                          }}
                          className="rounded-lg bg-[#1877f2] px-3 py-2 text-xs font-semibold text-white"
                        >
                          Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </main>

          <aside className="h-fit rounded-2xl border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">Artistas en comunidad</p>
            <div className="mt-3 space-y-2">
              {artists.slice(0, 8).map((artist) => (
                <Link
                  key={artist.id}
                  href={`/suscriptores/${artist.id}`}
                  className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-[#f5f7fa]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-[#d9dde3]">
                      <img src={artist.avatar || "/logo.png"} alt={artist.displayName} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1d2129]">{artist.displayName}</p>
                      <p className="text-[11px] text-[#65676b]">@{artist.handle}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#1877f2]">{artist.posts}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async () => {
  const creations = await prisma.creation.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      profile: {
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatar: true,
        },
      },
    },
  });

  return {
    props: {
      feed: creations.map((item) => ({
        id: item.id,
        title: item.title,
        cover: item.cover,
        type: item.type,
        createdAt: item.createdAt.toISOString(),
        profile: item.profile,
      })),
    },
  };
};
