import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import prisma from "@/lib/prisma";

export default function SuscriptorProfilePage({ profile }: any) {
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fafafa] px-6 py-14 text-[#111111]">
        <div className="mx-auto max-w-[760px] rounded-3xl border border-[#e5e7eb] bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Perfil no encontrado</h1>
          <p className="mt-3 text-base text-[#6b7280]">
            Este perfil no existe o fue eliminado.
          </p>
          <div className="mt-8">
            <Link
              href="/capacitaciones"
              className="inline-flex rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold text-white"
            >
              Volver a capacitaciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: session } = useSession();
  const isOwner = !!session?.user?.email && session.user.email === profile.user?.email;

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [location, setLocation] = useState(profile.location || "");
  const [newTitle, setNewTitle] = useState("");
  const [newCover, setNewCover] = useState("");
  const [newType, setNewType] = useState<"FOTO" | "VIDEO">("FOTO");
  const [activeTab, setActiveTab] = useState<"ALL" | "FOTO" | "VIDEO">("ALL");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<any | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const reelInputRef = useRef<HTMLInputElement | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  const creations = Array.isArray(profile.creations) ? profile.creations : [];
  const filteredCreations =
    activeTab === "ALL" ? creations : creations.filter((item: any) => item.type === activeTab);
  const photoCount = creations.filter((item: any) => item.type === "FOTO").length;
  const videoCount = creations.filter((item: any) => item.type === "VIDEO").length;
  const joinedText = profile.joined
    ? new Date(profile.joined).toLocaleDateString("es-PE", {
        month: "short",
        year: "numeric",
      })
    : "";

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFilePick = async (file: File | null, type: "FOTO" | "VIDEO") => {
    if (!file) return;
    setNewType(type);
    setSelectedFileName(file.name);
    setUploadingFile(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await fetch("/api/capacitaciones/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, data: dataUrl }),
      });
      const json = await response.json();
      if (!response.ok || !json?.url) {
        throw new Error(json?.error || "No se pudo subir el archivo");
      }
      setNewCover(String(json.url));
    } catch (error) {
      console.error(error);
      setSelectedFileName("");
      setNewCover("");
      window.alert("No se pudo subir el archivo seleccionado.");
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    if (!selectedCreation) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [selectedCreation]);

  useEffect(() => {
    const resetScroll = () => {
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    };
    resetScroll();
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(resetScroll);
    }
  }, [selectedCreation]);

  return (
    <>
      <Head>
        <title>{profile.displayName} | Perfil</title>
        <meta
          name="description"
          content={`Perfil de ${profile.displayName} en Capacitaciones Rossy Resina.`}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[#fafafa] text-[#111111]" style={{ fontFamily: '"Manrope", sans-serif' }}>
        <div className="mx-auto min-h-screen max-w-[1440px]">
          <main>
            <header className="border-b border-[#dbdbdb] bg-white">
              <div className="mx-auto flex max-w-[1060px] items-center justify-between px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-[#dbdbdb] bg-white">
                    <img src="/logo.png" alt="Rossy Resina" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d62976]"
                      style={{ fontFamily: '"Oswald", sans-serif' }}
                    >
                      Rossy Resina
                    </p>
                    <p className="text-xs text-[#737373]">Capacitaciones</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/capacitaciones"
                    className="rounded-full border border-[#dbdbdb] px-4 py-2 text-sm font-medium hover:bg-[#f7f7f7]"
                  >
                    Volver
                  </Link>
                  <Link
                    href="/suscripcion"
                    className="rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Suscribirse
                  </Link>
                </div>
              </div>
            </header>

            <div className="mx-auto max-w-[1060px] px-4 py-8 sm:px-6">
              <section id="perfil" className="grid gap-8 border-b border-[#dbdbdb] pb-10 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="flex justify-center md:justify-start">
                  <div className="h-[152px] w-[152px] overflow-hidden rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-1 sm:h-[184px] sm:w-[184px]">
                    <div className="h-full w-full overflow-hidden rounded-full border-[6px] border-white bg-[#f3f3f3]">
                      <img
                        src={profile.avatar || "/logo.png"}
                        alt={profile.displayName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[28px] font-semibold leading-none">{profile.handle}</h1>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        profile.status === "ACTIVO"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {profile.status === "ACTIVO" ? "Activo" : "Desactivado"}
                    </span>
                    {!isOwner && (
                      <>
                        <button className="rounded-lg bg-[#efefef] px-4 py-2 text-sm font-semibold hover:bg-[#e5e5e5]">
                          Seguir
                        </button>
                        <button className="rounded-lg bg-[#efefef] px-4 py-2 text-sm font-semibold hover:bg-[#e5e5e5]">
                          Mensaje
                        </button>
                      </>
                    )}
                    {isOwner ? (
                      <button
                        onClick={() => setEditOpen((value) => !value)}
                        className="min-w-[170px] rounded-lg bg-[#efefef] px-4 py-2 text-sm font-semibold hover:bg-[#e5e5e5]"
                      >
                        {editOpen ? "Cerrar edicion" : "Editar perfil"}
                      </button>
                    ) : (
                      <button className="rounded-lg border border-[#dbdbdb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f7f7]">
                        Compartir
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-8 text-[15px]">
                    <span>
                      <strong>{creations.length}</strong> publicaciones
                    </span>
                    <span>
                      <strong>{Math.max(12, creations.length * 3)}</strong> seguidores
                    </span>
                    <span>
                      <strong>{Math.max(7, photoCount + 4)}</strong> seguidos
                    </span>
                  </div>

                  <div className="max-w-[520px] space-y-1.5 text-sm">
                    <p className="font-semibold">{profile.displayName}</p>
                    <p className="text-[#262626]">{profile.bio || "Creadora en Rossy Resina."}</p>
                    <p className="text-[#737373]">{profile.location || "Peru"}</p>
                    <p className="text-[#737373]">{joinedText ? `Miembro desde ${joinedText}` : ""}</p>
                  </div>

                  {isOwner && (
                    <div className="flex items-start gap-4 pt-2">
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#dbdbdb] bg-white shadow-[inset_0_0_0_4px_#f2f2f2]">
                          <span className="text-4xl font-light text-[#9a9a9a]">+</span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-[#262626]">Nuevo</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {isOwner && editOpen && (
                <section className="mt-8 rounded-[28px] border border-[#dbdbdb] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Editar perfil</h2>
                    <p className="text-sm text-[#737373]">
                      Ajusta tu nombre visible, bio, ubicacion y avatar para Capacitaciones.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                        Nombre visible
                      </label>
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-2xl border border-[#dbdbdb] px-4 py-3 text-sm outline-none focus:border-[#d62976]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                        Ubicacion
                      </label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-2xl border border-[#dbdbdb] px-4 py-3 text-sm outline-none focus:border-[#d62976]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                        Avatar URL
                      </label>
                      <input
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full rounded-2xl border border-[#dbdbdb] px-4 py-3 text-sm outline-none focus:border-[#d62976]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-[#dbdbdb] px-4 py-3 text-sm outline-none focus:border-[#d62976]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await fetch("/api/capacitaciones/profile", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ displayName, bio, avatar, location }),
                          });
                          window.location.reload();
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="rounded-full bg-[#d62976] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </section>
              )}

              {isOwner && (
                <section
                  id="subir-creacion"
                  className="mt-8 rounded-[26px] border border-[#dbdbdb] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold">Publicar nueva creacion</h2>
                      <p className="text-sm text-[#737373]">
                        Comparte una foto o video para tu portafolio en Capacitaciones.
                      </p>
                    </div>
                    <div className="hidden rounded-full bg-[#f5f5f5] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#737373] sm:block">
                      {photoCount} fotos / {videoCount} videos
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Que estas pensando?"
                      className="w-full rounded-full bg-[#f0f2f5] px-5 py-3.5 text-[15px] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#f2b5cf]"
                    />
                  </div>

                  <div className="mt-4 border-t border-[#e6e6e6] pt-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void handleFilePick(file, file?.type.startsWith("video/") ? "VIDEO" : "FOTO");
                          e.currentTarget.value = "";
                        }}
                      />
                      <input
                        ref={reelInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void handleFilePick(file, "VIDEO");
                          e.currentTarget.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className={`flex min-w-[150px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          newType === "FOTO" && selectedFileName
                            ? "bg-[#eaf8ee] text-[#16a34a]"
                            : "bg-[#f4f4f5] text-[#5f6368] hover:bg-[#ededed]"
                        }`}
                      >
                        <span className="text-lg">[]</span>
                        Foto/video
                      </button>
                      <button
                        type="button"
                        onClick={() => reelInputRef.current?.click()}
                        className={`flex min-w-[150px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          newType === "VIDEO" && selectedFileName
                            ? "bg-[#ffe8ee] text-[#fb7185]"
                            : "bg-[#f4f4f5] text-[#fb7185] hover:bg-[#ededed]"
                        }`}
                      >
                        <span className="text-lg">R</span>
                        Reel
                      </button>
                      {uploadingFile && <div className="text-sm text-[#737373]">Subiendo archivo...</div>}
                      <button
                        onClick={async () => {
                          if (!newCover.trim()) {
                            window.alert("Selecciona un archivo antes de publicar.");
                            return;
                          }
                          setCreating(true);
                          try {
                            await fetch("/api/capacitaciones/creations", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: newTitle.trim() || "Nueva creacion",
                                cover: newCover,
                                type: newType,
                              }),
                            });
                            window.location.reload();
                          } finally {
                            setCreating(false);
                          }
                        }}
                        className="rounded-full bg-[#111111] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                        disabled={creating || uploadingFile}
                      >
                        {creating ? "Publicando..." : "Publicar"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <section className="mt-8">
                <div className="flex items-center justify-center gap-8 border-t border-[#dbdbdb]">
                  <button
                    onClick={() => setActiveTab("ALL")}
                    className={`px-3 py-4 text-xs font-semibold uppercase tracking-[0.22em] ${
                      activeTab === "ALL"
                        ? "border-t border-[#111111] text-[#111111]"
                        : "text-[#8e8e8e]"
                    }`}
                  >
                    Publicaciones
                  </button>
                  <button
                    onClick={() => setActiveTab("FOTO")}
                    className={`px-3 py-4 text-xs font-semibold uppercase tracking-[0.22em] ${
                      activeTab === "FOTO"
                        ? "border-t border-[#111111] text-[#111111]"
                        : "text-[#8e8e8e]"
                    }`}
                  >
                    Fotos
                  </button>
                  <button
                    onClick={() => setActiveTab("VIDEO")}
                    className={`px-3 py-4 text-xs font-semibold uppercase tracking-[0.22em] ${
                      activeTab === "VIDEO"
                        ? "border-t border-[#111111] text-[#111111]"
                        : "text-[#8e8e8e]"
                    }`}
                  >
                    Videos
                  </button>
                </div>

                {filteredCreations.length === 0 ? (
                  isOwner ? (
                    <div className="py-20 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#111111] text-3xl">
                        O
                      </div>
                      <h3 className="mt-5 text-[40px] font-semibold leading-none">Compartir fotos</h3>
                      <p className="mt-3 text-sm text-[#737373]">
                        Cuando compartas fotos, apareceran en tu perfil.
                      </p>
                      <button
                        onClick={() => {
                          const block = document.getElementById("subir-creacion");
                          block?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="mt-5 text-sm font-semibold text-[#0095f6]"
                      >
                        Comparte tu primera foto
                      </button>
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#dbdbdb] text-2xl">
                        +
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold">Sin publicaciones</h3>
                      <p className="mt-2 text-sm text-[#737373]">
                        Este perfil todavia no tiene creaciones visibles.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
                    {filteredCreations.map((item: any) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCreation(item)}
                        className="group relative aspect-square overflow-hidden bg-[#f0f0f0] text-left"
                      >
                        {item.type === "VIDEO" ? (
                          <video
                            src={item.cover}
                            className="h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/35" />
                        <div className="absolute inset-0 flex items-end justify-between p-3 opacity-0 transition duration-200 group-hover:opacity-100">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                            <p className="text-xs uppercase tracking-wide text-white/90">
                              {item.type === "VIDEO" ? "Video" : "Foto"}
                            </p>
                          </div>
                          <div className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold text-white">
                            {item.type === "VIDEO" ? "PLAY" : "POST"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>

        {selectedCreation && (
          <div
            className="fixed inset-0 z-50 bg-black/95"
            onClick={() => setSelectedCreation(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedCreation(null)}
              className="absolute left-5 top-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-4xl text-white"
            >
              x
            </button>

            <div
              key={selectedCreation.id}
              className="flex h-screen w-screen overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-w-0 flex-1 items-center justify-center bg-black">
                {selectedCreation.type === "VIDEO" ? (
                  <video
                    src={selectedCreation.cover}
                    className="max-h-full max-w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={selectedCreation.cover}
                    alt={selectedCreation.title}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              <aside
                className="flex h-full min-h-0 w-[520px] min-w-[520px] flex-col border-l border-[#1f2937] bg-[#0f1419] text-white"
              >
                <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-white/10">
                    <img
                      src={profile.avatar || "/logo.png"}
                      alt={profile.displayName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{profile.displayName}</p>
                    <p className="truncate text-base text-white/70">@{profile.handle}</p>
                  </div>
                </div>

                <div ref={modalScrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  <p className="whitespace-pre-line text-[18px] leading-9 text-white/95">
                    {selectedCreation.title || "Publicacion de creadora en Rossy Resina."}
                  </p>
                  <p className="mt-4 text-base text-white/60">Publicado en tu portafolio de capacitaciones.</p>

                  <div className="mt-8 flex items-center gap-8 border-y border-white/10 py-5 text-lg text-white/80">
                    <span>♡ {Math.max(17, selectedCreation.title.length * 3)}</span>
                    <span>↻ {Math.max(6, selectedCreation.title.length)}</span>
                    <span>◷ {Math.max(120, selectedCreation.title.length * 12)}</span>
                  </div>

                  <div className="mt-7 space-y-7">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-4">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                          <img src="/logo.png" alt="Suscriptor" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-white">suscriptor_{item}</p>
                          <p className="mt-1 text-[17px] leading-7 text-white/80">
                            {item === 1 && "Que bonito trabajo, se ve muy limpio."}
                            {item === 2 && "Me gusta mucho el acabado y la forma."}
                            {item === 3 && "Quedo excelente, felicitaciones."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 px-6 py-5">
                  <div className="flex items-center gap-3 rounded-full bg-white/5 px-5 py-4">
                    <input
                      type="text"
                      placeholder="Anade un comentario..."
                      className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/45"
                    />
                    <button type="button" className="text-base font-semibold text-[#1d9bf0]">
                      Enviar
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const id = String(ctx?.params?.id || "").trim();
  const profile = await prisma.subscriberProfile.findUnique({
    where: { id },
    include: { creations: true, user: true },
  });

  return {
    props: {
      profile: profile ? JSON.parse(JSON.stringify(profile)) : null,
    },
  };
};
