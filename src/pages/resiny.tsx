import Head from "next/head";
import AssistantRossy from "@/components/AssistantRossy";

export default function ResinyPage() {
  return (
    <>
      <Head>
        <title>Resiny | Asistente virtual de Rossy Resina</title>
        <meta
          name="description"
          content="Conversa con Resiny, asistente virtual de Rossy Resina para resolver dudas sobre resina, productos, técnicas y compras."
        />
      </Head>
      <AssistantRossy />
    </>
  );
}
