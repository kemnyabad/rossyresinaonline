import { useEffect, useMemo, useState } from "react";
import type { ProductProps } from "../../type";

const PRODUCTS_REFRESH_MS = 15000;

const sameProductSnapshot = (a: ProductProps[], b: ProductProps[]) =>
  JSON.stringify(a || []) === JSON.stringify(b || []);

export function useLiveProducts(initialProducts: ProductProps[] = [], refreshMs = PRODUCTS_REFRESH_MS) {
  const hasInitialProducts = Array.isArray(initialProducts) && initialProducts.length > 0;
  const [products, setProducts] = useState<ProductProps[]>(() =>
    Array.isArray(initialProducts) ? initialProducts : []
  );
  const [updatedAt, setUpdatedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!Array.isArray(initialProducts)) return;
    setProducts(initialProducts);
    setUpdatedAt(Date.now());
  }, [initialProducts]);

  useEffect(() => {
    let active = true;
    let timer: number | null = null;
    let inFlight = false;

    const refresh = async () => {
      if (!active || inFlight) return;
      inFlight = true;
      try {
        const res = await fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const next = await res.json();
        if (!active || !Array.isArray(next)) return;
        setProducts((prev) => {
          if (sameProductSnapshot(prev, next)) return prev;
          setUpdatedAt(Date.now());
          return next;
        });
      } catch {
        // Keep the last usable catalog if the device is offline or the API is temporarily unavailable.
      } finally {
        inFlight = false;
      }
    };

    const schedule = () => {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(refresh, Math.max(5000, refreshMs));
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    if (!hasInitialProducts) {
      refresh();
    }
    schedule();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshMs, hasInitialProducts]);

  return useMemo(() => ({ products, updatedAt }), [products, updatedAt]);
}
