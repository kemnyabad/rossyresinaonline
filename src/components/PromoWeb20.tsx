import Link from "next/link";
import { useEffect, useState } from "react";
import { trackPromoWEB20Viewed } from "@/lib/metaPixel";

type PromoStatus = {
  active: boolean;
  minimumSubtotal: number;
  discountValue: number;
};

const DEFAULT_PROMO: PromoStatus = {
  active: true,
  minimumSubtotal: 100,
  discountValue: 20,
};

const usePromoWeb20 = () => {
  const [promo, setPromo] = useState<PromoStatus>(DEFAULT_PROMO);

  useEffect(() => {
    let alive = true;
    fetch("/api/promo/web20")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setPromo({
          active: Boolean(data?.active),
          minimumSubtotal: Number(data?.minimumSubtotal || 100),
          discountValue: Number(data?.discountValue || 20),
        });
      })
      .catch(() => {
        if (alive) setPromo(DEFAULT_PROMO);
      });
    return () => {
      alive = false;
    };
  }, []);

  return promo;
};

export function PromoWeb20HomeBanner() {
  const promo = usePromoWeb20();

  useEffect(() => {
    if (promo.active) trackPromoWEB20Viewed();
  }, [promo.active]);

  if (!promo.active) return null;

  return (
    <section className="px-4 md:px-6">
      <Link
        href="/products"
        className="rr-shine block overflow-hidden rounded-lg border border-pink-200 bg-gradient-to-r from-[#fff0f7] via-white to-[#fef3c7] px-5 py-5 shadow-[0_8px_24px_rgba(203,41,158,0.10)] md:px-8 md:py-7"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex rounded-full bg-amazon_blue px-3 py-1 text-sm font-black text-white">
              🎁 WEB20
            </div>
            <h2 className="text-2xl font-black text-gray-950 md:text-4xl">
              Obtén S/{promo.discountValue.toFixed(0)} de descuento
            </h2>
            <p className="mt-2 text-sm font-semibold text-gray-700 md:text-lg">
              En compras desde S/{promo.minimumSubtotal.toFixed(0)}. Compra directamente desde nuestra web.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">🔥 Oferta limitada</span>
              <span className="rounded-full bg-pink-100 px-3 py-1 text-amazon_blue">🎁 Descuento web exclusivo</span>
            </div>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-amazon_blue px-6 text-sm font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)]">
            Comprar ahora
          </span>
        </div>
      </Link>
    </section>
  );
}

export function PromoWeb20TopBar() {
  const promo = usePromoWeb20();
  if (!promo.active) return null;

  return (
    <div className="sticky top-0 z-[80] border-b border-pink-200 bg-[#fff1f7] px-3 py-2 text-center text-sm font-black text-gray-950 shadow-sm">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5">
          <img
            src="/icons/cupon-movil.gif"
            alt=""
            aria-hidden="true"
            className="h-5 w-5 shrink-0 object-contain"
          />
          <span>WEB20 | S/{promo.discountValue.toFixed(0)} de descuento en compras desde S/{promo.minimumSubtotal.toFixed(0)}</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/cart" className="rounded-full bg-amazon_blue px-3 py-1 text-xs font-black text-white">
            Usar cupón
          </Link>
          <a
            href="https://wa.me/51966357648"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-amazon_blue bg-white px-3 py-1 text-xs font-black text-amazon_blue"
          >
            Atención al cliente
          </a>
        </div>
      </div>
    </div>
  );
}

export function PromoWeb20WelcomePopup() {
  const promo = usePromoWeb20();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!promo.active || typeof window === "undefined") return;
    const key = "rr_web20_popup_seen_at";
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const lastSeen = Number(window.localStorage.getItem(key) || 0);
    if (!lastSeen || Date.now() - lastSeen > sevenDays) {
      setOpen(true);
      window.localStorage.setItem(key, String(Date.now()));
      trackPromoWEB20Viewed();
    }
  }, [promo.active]);

  if (!promo.active || !open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-3 inline-flex rounded-full bg-pink-100 px-3 py-1 text-sm font-black text-amazon_blue">
          🎁 WEB20
        </div>
        <h2 className="text-2xl font-black text-gray-950">🎉 Bienvenida a Rossy Resina</h2>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          Obtén S/{promo.discountValue.toFixed(0)} de descuento usando el código:
        </p>
        <p className="mt-3 rounded-lg border border-dashed border-amazon_blue bg-pink-50 px-4 py-3 text-center text-2xl font-black text-amazon_blue">
          WEB20
        </p>
        <p className="mt-3 text-sm font-semibold text-gray-700">En compras desde S/{promo.minimumSubtotal.toFixed(0)}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-11 rounded-full border border-gray-300 text-sm font-black text-gray-800"
          >
            Cerrar
          </button>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex h-11 items-center justify-center rounded-full bg-amazon_blue text-sm font-black text-white"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  );
}
