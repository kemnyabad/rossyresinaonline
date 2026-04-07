import Head from "next/head";

export default function MaintenancePage() {
  const maintenanceMode =
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const rawProgress = Number(process.env.NEXT_PUBLIC_MAINTENANCE_PROGRESS || "0");
  const progress = Number.isFinite(rawProgress)
    ? Math.min(100, Math.max(0, rawProgress))
    : 0;

  return (
    <>
      <Head>
        <title>Rossy Resina | Mantenimiento</title>
        <meta
          name="description"
          content="Estamos trabajando en mejoras para tu tienda Rossy Resina. Volvemos en breve."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-purple-500">Rossy Resina</h1>
          <p className="text-xl text-slate-300">
            Estamos perfeccionando tu experiencia. Muy pronto nuevo catálogo.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Avance del mantenimiento</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Trabajando en el taller para traerte lo mejor de la resina.
          </p>
          <p className="text-xs text-slate-500">
            Estado: {maintenanceMode ? "Mantenimiento activo" : "Vista informativa"}
          </p>
        </div>
      </div>
    </>
  );
}
