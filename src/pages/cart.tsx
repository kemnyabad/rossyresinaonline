import React, { useEffect, useMemo, useState } from "react";
import { StateProps, StoreProduct } from "../../type";
import { useSelector } from "react-redux";
import CartProduct from "@/components/CartProduct";
import ResetCart from "@/components/ResetCart";
import Link from "next/link";
import { useRouter } from "next/router";
import FormattedPrice from "@/components/FormattedPrice";
import Products from "@/components/Products";
import { ChevronLeftIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const CartPage = () => {
  const router = useRouter();
  const cartItems = useSelector((state: StateProps) => (state.next?.productData || []) as StoreProduct[]);
  const [recs, setRecs] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum: number, p: StoreProduct) => sum + p.price * p.quantity,
      0
    );
    const total = subtotal;
    return { subtotal, total };
  }, [cartItems]);
  const totalUnits = useMemo(
    () => cartItems.reduce((sum: number, p: StoreProduct) => sum + p.quantity, 0),
    [cartItems]
  );
  const shippingAmount = 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows) => {
        if (!alive) return;
        setRecs(Array.isArray(rows) ? rows.slice(0, 12) : []);
      })
      .catch(() => {
        if (!alive) return;
        setRecs([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const recommendedProducts = useMemo(() => {
    if (Array.isArray(recs) && recs.length > 0) return recs;
    const fallback = cartItems.map((item: StoreProduct) => ({
      _id: item._id,
      code: item.code,
      title: item.title,
      brand: item.brand,
      category: item.category,
      description: item.description,
      image: item.image,
      images: item.images,
      isNew: item.isNew,
      oldPrice: item.oldPrice,
      price: item.price,
    }));
    return Array.from(new Map(fallback.map((p) => [String(p._id), p])).values()).slice(0, 8);
  }, [recs, cartItems]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-0 pb-[104px] pt-0 md:px-6 md:pb-8">
      {!mounted ? (
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 text-center md:rounded-none md:p-8">
          <h1 className="text-lg font-semibold text-gray-900">Cargando carrito...</h1>
        </div>
      ) : cartItems.length > 0 ? (
        <>
          <div className="sticky top-0 z-30 bg-white px-4 pb-3 pt-4 md:hidden">
            <div className="grid grid-cols-[46px_minmax(0,1fr)_46px] items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-950"
                aria-label="Volver"
              >
                <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
              </button>
              <h1 className="text-center text-xl font-black text-gray-950">Carrito</h1>
              <Link
                href="/"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-950"
                aria-label="Seguir comprando"
              >
                <EllipsisHorizontalIcon className="h-5 w-5 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-[480px] grid-cols-1 gap-2 px-2.5 pt-2.5 md:max-w-6xl md:px-0 md:pt-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="bg-white p-4 md:rounded-none md:p-0">
              <div className="hidden items-center justify-between border-b border-gray-300 px-4 py-4 md:flex md:px-5">
                <h1 className="text-2xl font-black text-gray-950 md:text-3xl">Carro de Compras</h1>
                <span className="hidden pr-20 text-lg text-gray-950 md:block">Precio</span>
              </div>

              <div className="space-y-4 md:space-y-0">
                {cartItems.map((item: StoreProduct) => (
                  <CartProduct key={item._id} item={item} />
                ))}
              </div>

              <div className="mt-5 hidden flex-col gap-3 border-t border-gray-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:flex md:px-5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <ResetCart />
                  <span className="hidden h-5 w-px bg-gray-200 sm:block" />
                  <Link href="/" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                    Seguir comprando
                  </Link>
                </div>
                <p className="text-right text-lg text-gray-950 md:text-xl">
                  Subtotal ({totalUnits} Producto{totalUnits !== 1 ? "s" : ""}):{" "}
                  <span className="font-black">
                    <FormattedPrice amount={totals.subtotal} />
                  </span>
                </p>
              </div>
            </section>

            <aside className="fixed bottom-0 left-0 right-0 z-[80] md:static md:z-auto">
              <div className="mx-auto w-full max-w-[480px] border-t border-gray-200 bg-white px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-6px_18px_rgba(17,24,39,0.08)] lg:sticky lg:top-24 md:max-w-none md:rounded-none md:border-t-0 md:p-4 md:shadow-none">
                <h2 className="hidden text-xl font-black text-gray-950 md:block">Resumen del pedido</h2>
                <div className="hidden space-y-2.5 border-b border-dashed border-gray-300 pb-3 text-sm md:mt-4 md:block md:space-y-3 md:border-gray-950 md:pb-3 md:text-lg">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 md:text-gray-950">Sub total</span>
                    <span className="text-gray-950">
                      <FormattedPrice amount={totals.subtotal} />
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 md:text-gray-950">Envío</span>
                    <span className="text-gray-950">
                      <FormattedPrice amount={shippingAmount} />
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_152px] items-center gap-3 md:mt-4 md:flex md:justify-between md:gap-4 md:text-xl md:font-black">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 md:hidden">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amazon_blue text-xs font-black text-white">
                      ✓
                    </span>
                    Todo
                  </div>
                  <div className="min-w-0 text-right md:text-left">
                    <p className="text-xs font-semibold text-gray-500 md:hidden">
                      Total
                    </p>
                    <p className="text-xl font-black leading-tight text-amazon_blue md:text-gray-950">
                      <FormattedPrice amount={totals.total + shippingAmount} />
                    </p>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex h-12 items-center justify-center rounded-full bg-amazon_blue px-4 text-base font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)] hover:brightness-95 md:mt-4 md:block md:h-16 md:rounded-md md:text-center md:text-xl md:font-medium md:leading-[64px]"
                  >
                    Comprar ({totalUnits})
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-4 hidden rounded-xl border border-gray-200 bg-white p-4 md:block md:p-5">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Puede que te interese</h3>
            {recommendedProducts.length > 0 ? (
              <Products
                productData={recommendedProducts}
                gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
              />
            ) : (
              <p className="text-sm text-gray-600">Aún no hay productos para recomendar.</p>
            )}
          </section>
        </>
      ) : (
        <div className="pt-7">
          <div className="rounded-xl border border-gray-200 bg-white px-10 py-10 text-center md:px-12 md:py-11">
            <h1 className="text-lg font-semibold text-gray-900">Tu carrito está vacío</h1>
            <p className="mt-1 text-sm text-gray-600">Descubre productos y agrega tus favoritos.</p>
            <p className="mt-4 text-sm text-gray-600">
              ¿Ya realizaste una compra? Consulta el estado de tu pedido con tu correo y número de pedido.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-full bg-[#c21885] px-6 py-2 text-sm font-semibold text-white hover:brightness-105"
            >
              Ir a comprar
            </Link>
            <Link
              href="/track-orders"
              className="ml-0 mt-3 inline-flex rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 sm:ml-3"
            >
              Consultar mi pedido
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
