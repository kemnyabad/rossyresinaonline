import Link from "next/link";

export default function CapacitacionesMaintenance() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-amber-50 via-white to-orange-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
          <div>
            <p className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Seccion temporal
            </p>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Sitio en construccion</h1>
            <p className="mt-3 text-base text-gray-700">
              Rossy Resina les agradece su visita. Pronto anunciaremos la apertura de esta seccion.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Estamos trabajando en la web de capacitaciones para darte una mejor experiencia.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Volver al inicio
              </Link>
              <Link
                href="/productos"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Ir a la tienda
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[280px]">
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 shadow-inner">
              <div className="rounded-md border border-gray-700 bg-gray-900 p-3">
                <div className="mb-3 flex gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-4/5 animate-pulse rounded bg-cyan-300/80" />
                  <div className="h-2 w-3/5 animate-pulse rounded bg-purple-300/80" />
                  <div className="h-2 w-2/3 animate-pulse rounded bg-emerald-300/80" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-orange-300/80" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="h-10 w-10 rounded-full border border-amber-300 bg-amber-100" />
              <div className="h-16 w-12 rounded-t-lg border border-blue-300 bg-blue-100" />
              <div className="h-12 w-14 rounded-md border border-rose-300 bg-rose-100" />
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">Equipo trabajando en la nueva seccion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
