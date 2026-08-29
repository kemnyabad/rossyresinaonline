import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  WHEEL_PRIZES,
  type WheelPrize,
  pickWeightedPrize,
  storeWonPrize,
} from "@/lib/wheelPrizes";

const SEGMENT_ANGLE = 360 / WHEEL_PRIZES.length;
const EXTRA_SPINS = 5;
const SPIN_DURATION_MS = 3600;
const SEGMENT_COLORS = ["#e4147f", "#fdf2f8", "#c21885", "#f0fdf4", "#e4147f"];

const wheelBackground = `conic-gradient(from 0deg, ${WHEEL_PRIZES.map((_, i) => {
  const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
  return `${color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`;
}).join(", ")})`;

const rotationToLand = (index: number) => {
  const centerAngle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  return EXTRA_SPINS * 360 + ((360 - centerAngle) % 360);
};

export default function SpinWheelPopup() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<WheelPrize | null>(null);
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
    const prize = pickWeightedPrize();
    const index = WHEEL_PRIZES.findIndex((p) => p.id === prize.id);
    setSpinning(true);
    setRotation(rotationToLand(index));
    spinTimer.current = setTimeout(() => {
      setSpinning(false);
      setWon(prize);
      storeWonPrize(prize.id);
    }, SPIN_DURATION_MS);
  };

  const handleClose = () => setOpen(false);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="animated fadeIn animate-fast fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="animated zoomIn animate-fast relative w-full max-w-md p-6 text-center sm:max-w-lg">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow hover:bg-gray-100"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {!won ? (
          <>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">Regalo especial para ti</h2>
            <p className="mt-2 text-lg font-semibold text-white/90 sm:text-xl">Gira para obtener tu premio</p>

            <div className="relative mx-auto mt-8 h-64 w-64 sm:h-96 sm:w-96">
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-amazon_blue drop-shadow sm:border-x-[14px] sm:border-t-[22px]" />
              </div>

              <div
                className="h-full w-full rounded-full border-[6px] border-white shadow-[0_14px_40px_rgba(0,0,0,0.4)] sm:border-[8px]"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 0.86, 0.20, 1)` : "none",
                }}
              >
                {WHEEL_PRIZES.map((_, i) => {
                  const boundaryAngle = i * SEGMENT_ANGLE - 180;
                  return (
                    <div
                      key={`divider-${i}`}
                      className="absolute left-1/2 top-1/2 h-1/2 w-0 origin-top"
                      style={{ transform: `rotate(${boundaryAngle}deg)` }}
                    >
                      <div className="absolute left-0 top-0 h-full w-[2px] -translate-x-1/2 bg-white/80 sm:w-[3px]" />
                    </div>
                  );
                })}

                {WHEEL_PRIZES.map((prize, i) => {
                  const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - 180;
                  return (
                    <div
                      key={prize.id}
                      className="absolute left-1/2 top-1/2 h-1/2 w-0 origin-top"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2">
                        {prize.type === "mold" ? (
                          <div className="relative h-16 w-16 overflow-hidden rounded-full border-[3px] border-white shadow-md sm:h-24 sm:w-24">
                            <Image src={prize.productImage} alt={prize.productTitle} fill sizes="96px" className="object-cover" />
                          </div>
                        ) : prize.themeImage ? (
                          <div className="relative h-16 w-16 overflow-hidden rounded-full border-[3px] border-white shadow-md sm:h-24 sm:w-24">
                            <Image src={prize.themeImage} alt={prize.themeLabel || "Premio"} fill sizes="96px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border-[3px] border-white bg-white shadow-md sm:h-24 sm:w-24">
                            <span className="text-lg font-black leading-none text-amazon_blue sm:text-2xl">
                              S/{prize.discountValue}
                            </span>
                            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">
                              dscto.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amazon_blue shadow sm:h-6 sm:w-6" />
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className="mt-8 flex h-16 w-full items-center justify-center rounded-full bg-amazon_blue text-2xl font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)] disabled:cursor-not-allowed"
            >
              {spinning ? "Girando..." : "Girar"}
            </button>
            <p className="mt-3 text-base font-semibold text-white/80">100% probabilidad de ganar</p>
          </>
        ) : (
          <div className="py-4">
            {won.type === "mold" ? (
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:h-48 sm:w-48">
                <Image src={won.productImage} alt={won.productTitle} fill sizes="192px" className="object-cover" />
              </div>
            ) : won.themeImage ? (
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:h-48 sm:w-48">
                <Image src={won.themeImage} alt={won.themeLabel || "Premio"} fill sizes="192px" className="object-cover" />
              </div>
            ) : (
              <div className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-white bg-white shadow-lg sm:h-40 sm:w-40">
                <span className="text-4xl font-black leading-none text-amazon_blue sm:text-5xl">S/{won.discountValue}</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500 sm:text-sm">descuento</span>
              </div>
            )}
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{won.wonLabel}</h2>
            <p className="mt-3 text-lg text-white/90">Se aplicará automáticamente en tu próxima compra.</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-8 flex h-16 w-full items-center justify-center rounded-full bg-amazon_blue text-2xl font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)]"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
