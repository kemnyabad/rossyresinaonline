import Link from "next/link";
import { useEffect, useState } from "react";

type TopBarAd = {
  title: string;
  subtitle: string;
  tags: string[];
  cta: string;
  href: string;
};

const ADS: TopBarAd[] = [
  {
    title: "PARTICIPA Y GANA! KIT RESINERO +20%",
    subtitle: "En tu primera jugada. Válido para nuevas participantes.",
    tags: ["Cupos limitados", "Ganadores semanales", "Participación gratis"],
    cta: "Participar ahora",
    href: "/sorteos-resineros",
  },
  {
    title: "NUEVA COLECCIÓN DE MOLDES DISPONIBLE",
    subtitle: "Modelos exclusivos para velas, llaveros y bisutería.",
    tags: ["Stock nuevo", "Entrega rápida", "Compra segura"],
    cta: "Ver moldes",
    href: "/categoria/moldes-de-silicona",
  },
  {
    title: "OFERTAS FLASH EN RESINAS Y PIGMENTOS",
    subtitle: "Aprovecha precios especiales por tiempo limitado.",
    tags: ["Descuentos reales", "Top vendidos", "Hasta agotar stock"],
    cta: "Ver ofertas",
    href: "/productos?ofertas=1",
  },
];

const TopBar = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (ADS.length <= 1) return;

    const rotateEveryMs = 4800;
    const fadeMs = 350;

    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % ADS.length);
        setVisible(true);
      }, fadeMs);
    }, rotateEveryMs);

    return () => window.clearInterval(interval);
  }, []);

  const current = ADS[index];

  return (
    <div className="w-full border-b border-white/10 bg-gradient-to-r from-[#1460d2] via-[#2667d9] to-[#7d43de] text-white">
      <div className="mx-auto w-full px-5 lg:px-6">
        <section
          className={`relative overflow-hidden py-2 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <div className="grid items-center gap-2 md:gap-3 md:grid-cols-[1.35fr_auto_auto]">
            <div className="min-w-0">
              <p className="mt-0.5 text-[15px] font-extrabold leading-[1.1] tracking-[0.01em] md:text-[20px] lg:text-[22px] xl:text-[24px]">
                {current.title}
              </p>
              <p className="text-[11px] font-medium leading-[1.25] text-white/90 md:text-[13px] lg:text-[14px]">
                {current.subtitle}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2.5">
              {current.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>

            <Link
              href={current.href}
              className="inline-flex h-9 md:h-10 items-center justify-center rounded-full bg-[#ff2f74] px-4 md:px-7 text-[14px] md:text-[17px] font-extrabold text-white transition hover:brightness-95 whitespace-nowrap"
            >
              {current.cta}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TopBar;
