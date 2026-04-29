import React, { useEffect, useMemo, useState } from "react";
import { StateProps, StoreProduct } from "../../type";
import { useSelector } from "react-redux";
import CartProduct from "@/components/CartProduct";
import ResetCart from "@/components/ResetCart";
import Link from "next/link";
import FormattedPrice from "@/components/FormattedPrice";
import Products from "@/components/Products";
import { FiCreditCard, FiInfo, FiShoppingCart } from "react-icons/fi";

const CheckoutSteps = () => {
  const steps = [
    { label: "Carro de Compras", icon: FiShoppingCart, active: true },
    { label: "Información de Envío", icon: FiInfo, active: false },
    { label: "Pago", icon: FiCreditCard, active: false },
  ];

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 md:py-10">
      <div className="grid grid-cols-3 items-start">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative flex flex-col items-center text-center">
              {index > 0 && (
                <span className="absolute right-1/2 top-8 h-px w-full bg-gray-300" aria-hidden="true" />
              )}
              <span
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white ${
                  step.active ? "bg-orange-600" : "bg-gray-400"
                }`}
              >
                <Icon />
              </span>
              <span className="mt-5 text-sm font-medium text-gray-950 md:text-base">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CartPage = () => {
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
    <div className="min-h-screen bg-[#f5f5f5] px-3 pb-8 md:px-6">
      {!mounted ? (
        <div className="mx-auto max-w-6xl bg-white p-6 text-center md:p-8">
          <h1 className="text-lg font-semibold text-gray-900">Cargando carrito...</h1>
        </div>
      ) : cartItems.length > 0 ? (
        <>
          <CheckoutSteps />

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="bg-white">
              <div className="flex items-center justify-between border-b border-gray-300 px-4 py-4 md:px-5">
                <h1 className="text-2xl font-black text-gray-950 md:text-3xl">Carro de Compras</h1>
                <span className="hidden pr-20 text-lg text-gray-950 md:block">Precio</span>
              </div>

              <div>
                {cartItems.map((item: StoreProduct) => (
                  <CartProduct key={item._id} item={item} />
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-5">
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

            <aside>
              <div className="bg-white p-4 lg:sticky lg:top-24">
                <h2 className="text-xl font-black text-gray-950">Resumen del pedido</h2>
                <div className="mt-4 space-y-3 border-b border-gray-950 pb-3 text-lg">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-950">Productos</span>
                    <span className="text-gray-950">
                      <FormattedPrice amount={totals.subtotal} />
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between gap-4 text-xl font-black text-gray-950">
                  <span>Subtotal</span>
                  <span>
                    <FormattedPrice amount={totals.total} />
                  </span>
                </div>
                <Link
                  href="/checkout"
                  className="mt-4 block h-16 w-full rounded-md bg-orange-600 text-center text-xl font-medium leading-[64px] text-white hover:bg-orange-700"
                >
                  Realizar pedido
                </Link>
              </div>
            </aside>
          </div>

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 md:p-5">
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
            <h1 className="text-lg font-semibold text-gray-900">Tu carrito esta vacio</h1>
            <p className="mt-1 text-sm text-gray-600">Descubre productos y agrega tus favoritos.</p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-full bg-[#c21885] px-6 py-2 text-sm font-semibold text-white hover:brightness-105"
            >
              Ir a comprar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
