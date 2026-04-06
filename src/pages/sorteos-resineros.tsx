import Head from "next/head";
import Link from "next/link";

export default function SorteosResinerosPage() {
  return (
    <>
      <Head>
        <title>Sorteos Resineros | Rossy Resina</title>
        <meta
          name="description"
          content="Participa en sorteos resineros de Rossy Resina y gana kits, moldes y pigmentos."
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-purple-50 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#105fd2] via-[#1f66d9] to-[#8246dd] p-5 text-white shadow-lg md:p-8">
            <span className="absolute left-4 top-4 inline-flex rounded-r-lg rounded-bl-lg bg-[#e52131] px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
              Sorteo de bienvenida
            </span>

            <div className="mt-8 grid items-center gap-5 md:mt-2 md:grid-cols-[1fr_170px_1fr_auto]">
              <div>
                <p className="text-[28px] font-black leading-tight md:text-[38px]">PARTICIPA Y GANA!</p>
                <p className="mt-1 text-sm text-white/85 md:text-base">Premios para resineras creativas de la comunidad Rossy.</p>
              </div>

              <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center rounded-full border-4 border-white/70 bg-[#0b4ec2] p-4 text-center shadow-xl">
                <p className="text-lg font-black leading-tight">
                  KIT
                  <br />
                  RESINERO
                  <br />
                  +20%
                </p>
              </div>

              <div>
                <p className="text-xl font-extrabold uppercase md:text-3xl">en tu primera jugada</p>
                <p className="mt-1 text-xs text-white/80 md:text-sm">
                  *V?lido para nuevas participantes. Aplican t?rminos y condiciones del sorteo.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff2f74] px-7 text-base font-extrabold text-white transition hover:scale-[1.03] hover:brightness-95"
              >
                Participar ahora
              </Link>
            </div>

            <span className="absolute right-16 top-8 h-4 w-4 rounded-full bg-[#ffd34d]/80" />
            <span className="absolute bottom-6 left-24 h-3 w-3 rounded-full bg-[#ffd34d]/80" />
            <span className="absolute right-40 bottom-10 h-2.5 w-2.5 rounded-full bg-white/80" />
          </section>

          <div className="mt-6 rounded-2xl border border-fuchsia-200 bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Sorteos resineros Rossy</h1>
            <p className="mt-2 text-gray-600">
              Registra tu participacion para entrar al proximo sorteo y ganar kits, moldes y pigmentos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700">
                Quiero participar
              </Link>
              <Link href="/" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                Ir al inicio
              </Link>
              <Link href="/productos" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Ver productos
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
