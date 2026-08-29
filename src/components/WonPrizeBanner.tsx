import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { addToCart } from "@/store/nextSlice";
import { getActiveWonPrize, buildMoldCartPayload, type WheelPrize } from "@/lib/wheelPrizes";

export default function WonPrizeBanner() {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [prize, setPrize] = useState<WheelPrize | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrize(getActiveWonPrize());
  }, []);

  if (!mounted || !prize || dismissed) return null;

  const handleClaim = () => {
    if (prize.type !== "mold") return;
    dispatch(addToCart(buildMoldCartPayload(prize) as any));
    setClaimed(true);
  };

  return createPortal(
    <div className="animated fadeIn animate-fast fixed left-3 right-3 top-16 z-[95] mx-auto max-w-sm overflow-hidden rounded-lg bg-gradient-to-r from-[#e4147f] to-[#c21885] px-4 py-3 text-white shadow-[0_8px_20px_rgba(203,41,158,0.35)] md:left-auto md:right-6 md:top-24 md:w-[340px]">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
        aria-label="Cerrar"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <div className="pr-8">
        {prize.type === "mold" ? (
          <>
            <p className="text-sm font-black uppercase tracking-wide">🎁 ¡Tienes un premio esperando!</p>
            <p className="mt-0.5 text-sm font-semibold text-white/90">
              Ganaste el molde {prize.productTitle}. Resérvalo antes de que se acabe el stock.
            </p>
            {!claimed ? (
              <button
                type="button"
                onClick={handleClaim}
                className="mt-2 rounded-full bg-white px-4 py-1.5 text-xs font-black text-amazon_blue"
              >
                Reclamar ahora
              </button>
            ) : (
              <p className="mt-2 text-xs font-bold">✓ Se agregó a tu carrito</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-black uppercase tracking-wide">🎉 ¡Tienes S/{prize.discountValue} de descuento!</p>
            <p className="mt-0.5 text-sm font-semibold text-white/90">
              Aprovéchalo antes de que se pierda.
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
