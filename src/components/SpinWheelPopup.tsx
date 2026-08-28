import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * TODO(premio real): esta ruleta todavia usa un premio de relleno.
 * Cuando se defina el premio real (cupon, descuento, etc.), reemplazar
 * PRIZE con el titulo/descripcion/CTA definitivos.
 */
const PRIZE = {
  label: "¡Ganaste un premio especial!",
  description: "Muy pronto podrás canjearlo.",
  ctaLabel: "Entendido",
  ctaHref: "" as string,
};

const SEGMENTS = [
  { label: "🎁", isPrize: true },
  { label: "✨", isPrize: false },
  { label: "🎉", isPrize: false },
  { label: "💝", isPrize: false },
  { label: "🌟", isPrize: false },
  { label: "🎊", isPrize: false },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const PRIZE_INDEX = SEGMENTS.findIndex((s) => s.isPrize);
const PRIZE_CENTER_ANGLE = PRIZE_INDEX * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
const EXTRA_SPINS = 5;
const TARGET_ROTATION = EXTRA_SPINS * 360 + ((360 - PRIZE_CENTER_ANGLE) % 360);
const SPIN_DURATION_MS = 3600;

const wheelBackground = `conic-gradient(from 0deg, ${SEGMENTS.map((seg, i) => {
  const color = seg.isPrize ? "#e4147f" : i % 2 === 0 ? "#fdf2f8" : "#f0fdf4";
  return `${color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`;
}).join(", ")})`;

export default function SpinWheelPopup() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  useEffect(() => () => {
    if (spinTimer.current) clearTimeout(spinTimer.current);
  }, []);

  const handleSpin = () => {
    if (spinning || won) return;
    setSpinning(true);
    setRotation(TARGET_ROTATION);
    spinTimer.current = setTimeout(() => {
      setSpinning(false);
      setWon(true);
    }, SPIN_DURATION_MS);
  };

  const handleClose = () => setOpen(false);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="animated fadeIn animate-fast fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="animated zoomIn animate-fast relative w-full max-w-sm p-6 text-center">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow hover:bg-gray-100"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {!won ? (
          <>
            <h2 className="text-xl font-black text-white">Regalo especial para ti</h2>
            <p className="mt-1 text-sm font-semibold text-white/80">Gira para obtener tu premio</p>

            <div className="relative mx-auto mt-6 h-64 w-64">
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-amazon_blue drop-shadow" />
              </div>

              <div
                className="h-full w-full rounded-full border-[6px] border-white shadow-[0_10px_30px_rgba(17,24,39,0.25)]"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 0.86, 0.20, 1)` : "none",
                }}
              >
                {SEGMENTS.map((seg, i) => {
                  const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 h-1/2 origin-top"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <span className="mt-4 block -translate-x-1/2 text-2xl">{seg.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amazon_blue shadow" />
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-amazon_blue text-base font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)] disabled:opacity-70"
            >
              {spinning ? "Girando..." : "Girar"}
            </button>
            <p className="mt-2 text-xs font-semibold text-white/70">100% probabilidad de ganar</p>
          </>
        ) : (
          <div className="py-4">
            <p className="text-5xl">🎉</p>
            <h2 className="mt-3 text-xl font-black text-white">{PRIZE.label}</h2>
            <p className="mt-2 text-sm text-white/80">{PRIZE.description}</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-amazon_blue text-base font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)]"
            >
              {PRIZE.ctaLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
