import Head from "next/head";
import type { GetServerSideProps } from "next";

type MaintenancePageProps = {
  progress: number;
  maintenanceMode: boolean;
};

const clampProgress = (value: unknown): number => {
  const n = Number.parseFloat(String(value ?? "0"));
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
};

const getStageLabel = (progress: number): string => {
  if (progress >= 95) return "Ajustes finales";
  if (progress >= 75) return "Pruebas de calidad";
  if (progress >= 45) return "Integrando mejoras";
  if (progress >= 15) return "Actualizando catálogo";
  return "Preparando entorno";
};

export default function MaintenancePage({ progress, maintenanceMode }: MaintenancePageProps) {
  const stage = getStageLabel(progress);

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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,.28),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,.22),transparent_36%)]" />
        <div className="relative flex min-h-screen items-center justify-center p-5">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-sm md:p-10">
            <div className="space-y-7 text-center">
              <div className="space-y-3">
                <p className="inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
                  Mantenimiento Rossy Resina
                </p>
                <h1 className="text-4xl font-extrabold text-purple-400 md:text-5xl">Rossy Resina</h1>
                <p className="text-base leading-relaxed text-slate-300 md:text-lg">
                  Estamos perfeccionando tu experiencia. Muy pronto tendrás nuevas mejoras en tienda.
                </p>
              </div>

              <div className="space-y-2 text-left">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Avance del mantenimiento</span>
                  <span className="font-bold text-purple-300">{progress}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-700/80 ring-1 ring-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-sm">
                <span className="text-slate-300">Etapa actual</span>
                <span className="font-semibold text-indigo-300">{stage}</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-400">
                  Trabajando en el taller para traerte lo mejor de la resina.
                </p>
                <p className="text-xs text-slate-500">
                  Estado: {maintenanceMode ? "Mantenimiento activo" : "Vista informativa"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<MaintenancePageProps> = async (ctx) => {
  ctx.res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  ctx.res.setHeader("Pragma", "no-cache");
  ctx.res.setHeader("Expires", "0");

  const maintenanceMode =
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // Soporta variable dedicada o la publica actual de Vercel.
  const progress = clampProgress(
    process.env.MAINTENANCE_PROGRESS ?? process.env.NEXT_PUBLIC_MAINTENANCE_PROGRESS
  );

  return {
    props: {
      progress,
      maintenanceMode,
    },
  };
};
