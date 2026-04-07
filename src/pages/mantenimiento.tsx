import Head from "next/head";
import MaintenanceView from "@/components/MaintenanceView";

export default function MaintenancePage() {
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
      <MaintenanceView />
    </>
  );
}
