import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../images/logo.jpg";

const TARGET = Math.min(
  100,
  Math.max(0, parseInt(process.env.NEXT_PUBLIC_MAINTENANCE_PROGRESS || "87", 10) || 87)
);

export default function MaintenancePage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = () => {
      current += 1;
      setProgress(current);
      if (current < TARGET) setTimeout(step, 18);
    };
    const t = setTimeout(step, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: "radial-gradient(ellipse at 60% 0%, #3b0764 0%, #1a0533 60%, #0f0221 100%)",
        backgroundImage:
          "radial-gradient(ellipse at 60% 0%, #3b0764 0%, #1a0533 60%, #0f0221 100%), radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 28px 28px",
      }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="rounded-full p-1.5 shadow-xl ring-2 ring-purple-400/30 bg-white">
          <Image
            src={logo}
            alt="Rossy Resina"
            width={72}
            height={72}
            className="rounded-full object-contain"
            priority
          />
        </div>
        <span className="text-white/80 text-sm font-semibold tracking-widest uppercase">
          Rossy Resina
        </span>
      </div>

      {/* Textos */}
      <h1 className="text-white font-black text-3xl sm:text-4xl leading-tight max-w-md mb-3">
        Estamos perfeccionando tu experiencia con la resina
      </h1>
      <p className="text-purple-200/80 text-base sm:text-lg max-w-sm mb-10">
        Muy pronto podrás disfrutar de nuestro nuevo catálogo optimizado
      </p>

      {/* Barra de progreso */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Progreso</span>
          <span className="text-white font-black text-lg tabular-nums">{progress}%</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(139,92,246,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Puntos animados */}
      <div className="mt-10 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <p className="text-white/20 text-xs mt-10">Rossy Resina &copy; {new Date().getFullYear()}</p>
    </div>
  );
}
