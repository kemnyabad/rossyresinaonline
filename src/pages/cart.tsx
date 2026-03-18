import React, { useEffect, useMemo, useState } from "react";
import { StateProps, StoreProduct } from "../../type";
import { useSelector } from "react-redux";
import CartProduct from "@/components/CartProduct";
import ResetCart from "@/components/ResetCart";
import Link from "next/link";
import CartPayment from "@/components/CartPayment";
import FormattedPrice from "@/components/FormattedPrice";
import Products from "@/components/Products";

const CartPage = () => {
  const { productData: cartItems } = useSelector((state: StateProps) => state.next);
  const [recs, setRecs] = useState<any[]>([]);
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum: number, p: StoreProduct) => sum + p.price * p.quantity, 0);
    const total = subtotal;
    return { subtotal, total };
  }, [cartItems]);

  const freeShippingGap = Math.max(0, 120 - totals.subtotal);
  useEffect(() => {
    let mounted = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((rows) => {
        if (!mounted) return;
        setRecs(Array.isArray(rows) ? rows.slice(0, 10) : []);
      })
      .catch(() => {
        if (!mounted) return;
        setRecs([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <section className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Carrito de compras</h1>
                <span className="text-sm text-gray-500">{cartItems.length} articulo(s)</span>
              </div>
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {freeShippingGap > 0 ? (
                  <span>Agrega <strong>S/ {freeShippingGap.toFixed(2)}</strong> para envio gratis.</span>
                ) : (
                  <span>Envio gratis aplicado a tu pedido.</span>
                )}
                <div className="mt-2 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (totals.subtotal / 120) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-lg font-semibold text-gray-900">Tus productos</h2>
                <div className="flex items-center gap-3">
                  <ResetCart />
                  <Link href="/" className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-100">Seguir comprando</Link>
                </div>
              </div>
              <div className="pt-3 flex flex-col gap-3">
                {cartItems.map((item: StoreProduct) => (
                  <div key={item._id}>
                    <CartProduct item={item} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Puede que te interese</h3>
              <Products
                productData={recs}
                gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-5"
              />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span><FormattedPrice amount={totals.subtotal} /></span></div>
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span><FormattedPrice amount={totals.total} /></span></div>
              </div>
              <Link href="/checkout" className="mt-4 block w-full h-11 text-sm font-semibold bg-orange-500 text-white rounded-full hover:brightness-105 text-center leading-[44px]">
                Ir a pagar
              </Link>
              <div className="mt-3 grid gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Pagos seguros y protegidos
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Devoluciones sin costo segun politica
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Envios a todo Peru
                </div>
              </div>
            </div>

          </aside>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900">Tu carrito esta vacio</h1>
          <p className="text-sm text-gray-600 mt-1">Descubre productos y agrega tus favoritos.</p>
          <Link href="/" className="inline-flex mt-4 px-5 py-2 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95">Ir a comprar</Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;


