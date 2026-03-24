import Head from "next/head";
import CapacitacionesMaintenance from "@/components/CapacitacionesMaintenance";

export default function CapacitacionDetailPage() {
  return (
    <>
      <Head>
        <title>Capacitaciones en construccion | Rossy Resina</title>
        <meta
          name="description"
          content="Sitio en construccion. Rossy Resina les agradece su visita. Pronto anunciaremos la apertura de esta seccion."
        />
      </Head>
      <CapacitacionesMaintenance />
    </>
  );
}

