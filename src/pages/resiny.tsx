import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import AssistantRossy from "@/components/AssistantRossy";

export default function ResinyPage() {
  const [loadingResiny, setLoadingResiny] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingResiny(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Resiny | Asistente virtual de Rossy Resina</title>
        <meta
          name="description"
          content="Conversa con Resiny, asistente virtual de Rossy Resina para resolver dudas sobre resina, productos, técnicas y compras."
        />
      </Head>
      {loadingResiny ? (
        <section className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-white px-4">
          <style jsx global>{`
            @keyframes resiny-load-in {
              from { opacity: 0; transform: translateY(12px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes resiny-load-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-7px); }
            }
            @keyframes resiny-load-dot {
              0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
              40% { opacity: 1; transform: translateY(-3px); }
            }
          `}</style>
          <div className="flex -translate-y-8 flex-col items-center" style={{ animation: "resiny-load-in 420ms ease-out both" }}>
            <div className="relative h-44 w-40 md:h-52 md:w-48">
              <Image
                src="/resiny.png"
                alt="Resiny"
                fill
                className="object-contain drop-shadow-[0_18px_34px_rgba(203,41,158,0.18)]"
                style={{ animation: "resiny-load-float 2.8s ease-in-out infinite" }}
                priority
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Cargando Resiny</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amazon_blue" style={{ animation: "resiny-load-dot 1.1s infinite" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-amazon_blue" style={{ animation: "resiny-load-dot 1.1s infinite 140ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-amazon_blue" style={{ animation: "resiny-load-dot 1.1s infinite 280ms" }} />
              </span>
            </div>
          </div>
        </section>
      ) : (
        <AssistantRossy />
      )}
    </>
  );
}
