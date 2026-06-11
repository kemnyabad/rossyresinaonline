import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { StateProps, StoreProduct } from "../../type";
import { useDispatch, useSelector } from "react-redux";
import CartProduct from "@/components/CartProduct";
import ResetCart from "@/components/ResetCart";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import FormattedPrice from "@/components/FormattedPrice";
import Products from "@/components/Products";
import { getBundleLineTotal } from "@/lib/bundlePromo";
import {
  Bars3Icon,
  ChevronLeftIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { addToCart, clearPromoCoupon, decreaseQuantity, deleteProduct, increaseQuantity } from "@/store/nextSlice";

const CartPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: StateProps) => (state.next?.productData || []) as StoreProduct[]);
  const [recs, setRecs] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum: number, p: StoreProduct) => sum + getBundleLineTotal(p), 0);
    const discount = 0;
    const total = subtotal;
    return { subtotal, discount, total };
  }, [cartItems]);
  const totalUnits = useMemo(
    () => cartItems.reduce((sum: number, p: StoreProduct) => sum + p.quantity, 0),
    [cartItems]
  );
  const shippingAmount = 0;
  const selectedCount = cartItems.length;
  const originalTotal = cartItems.reduce((sum, item) => sum + Number(item.oldPrice || item.price) * item.quantity, 0);
  const hasCartDiscount = originalTotal > totals.total;
  const formatPlainPrice = (value: number) => `S/ ${Number(value || 0).toFixed(2)}`;
  const normalizeCartImage = (src?: string) => {
    const raw = String(src || "").replace(/\\/g, "/");
    if (!raw) return "/favicon-96x96.png";
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
  };
  const discountLabel = (oldPrice?: number, price?: number) => {
    if (typeof oldPrice !== "number" || !price || oldPrice <= price) return "";
    return `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
  };

  useEffect(() => {
    setMounted(true);
    dispatch(clearPromoCoupon());
  }, [dispatch]);

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
      bundleQuantity: item.bundleQuantity,
      bundlePrice: item.bundlePrice,
    }));
    return Array.from(new Map(fallback.map((p) => [String(p._id), p])).values()).slice(0, 8);
  }, [recs, cartItems]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-0 pb-[92px] pt-0 md:px-6 md:pb-8">
      {!mounted ? (
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 text-center md:rounded-none md:p-8">
          <h1 className="text-lg font-semibold text-gray-900">Cargando carrito...</h1>
        </div>
      ) : cartItems.length > 0 ? (
        <>
          <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 pb-3 pt-4 md:hidden">
            <div className="grid grid-cols-[46px_minmax(0,1fr)_46px] items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center text-gray-950"
                aria-label="Volver"
              >
                <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
              </button>
              <h1 className="text-center text-xl font-black text-gray-950">Carrito ({selectedCount})</h1>
              <button
                type="button"
                className="ml-auto flex h-9 w-9 items-center justify-center text-gray-950"
                aria-label="Menú"
              >
                <Bars3Icon className="h-7 w-7 stroke-[2.2]" />
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <section className="space-y-2 bg-[#f5f5f5] px-2 py-2">
              {cartItems.map((item) => {
                const itemDiscount = discountLabel(item.oldPrice, item.price);
                return (
                  <article
                    key={item.cartKey || item._id}
                    className="grid grid-cols-[clamp(112px,31vw,135px)_minmax(0,1fr)] gap-3 rounded-lg bg-white px-2.5 py-3 shadow-[0_1px_2px_rgba(17,24,39,0.06)] min-[390px]:grid-cols-[clamp(124px,34vw,145px)_minmax(0,1fr)] min-[390px]:px-3"
                  >
                    <Link href={`/${item.code || item.productId || item._id}`} className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                      <Image src={normalizeCartImage(item.image)} alt={item.title || "Producto"} fill className="object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-col rounded-md bg-white">
                      <div className="rounded-md bg-gray-50 px-2.5 py-2">
                        <div className="flex items-start gap-2">
                        <Link href={`/${item.code || item.productId || item._id}`} className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-gray-800 min-[390px]:text-[15px]">{item.title}</p>
                          {item.variantLabel ? (
                            <p className="mt-1 text-xs font-semibold text-amazon_blue">{item.variantLabel}</p>
                          ) : null}
                          <p className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600">
                            {item.quantity} unidad{item.quantity > 1 ? "es" : ""}
                          </p>
                        </Link>
                        <button
                          type="button"
                          onClick={() => dispatch(deleteProduct({ _id: item._id, cartKey: item.cartKey }))}
                          className="shrink-0 text-gray-500"
                          aria-label="Eliminar producto"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col items-stretch gap-2 rounded-md bg-white px-1 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
                        <div className="flex min-w-0 items-center text-left">
                          <p className="flex flex-wrap items-center gap-1 text-lg font-black leading-tight text-gray-950 min-[390px]:text-xl">
                            {itemDiscount && (
                              <span className="rounded border border-amazon_blue px-1 text-xs font-bold leading-5 text-amazon_blue min-[390px]:text-sm">
                                {itemDiscount}
                              </span>
                            )}
                            <FormattedPrice amount={item.price} />
                            <span className="ml-1 text-sm font-semibold text-amazon_blue">c/u</span>
                          </p>
                        </div>
                        <div className="ml-auto flex h-9 shrink-0 items-center overflow-hidden rounded-md border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={() => dispatch(decreaseQuantity({ _id: item._id, cartKey: item.cartKey }))}
                            className="flex h-9 w-8 items-center justify-center text-lg min-[390px]:w-9"
                            aria-label="Reducir cantidad"
                          >
                            -
                          </button>
                          <span className="min-w-[30px] text-center text-base min-[390px]:min-w-[34px]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => dispatch(increaseQuantity({ _id: item._id, cartKey: item.cartKey }))}
                            className="flex h-9 w-8 items-center justify-center text-lg min-[390px]:w-9"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="grid grid-cols-2 gap-1 bg-white pt-3">
              {recommendedProducts.slice(0, 10).map((product: any) => {
                const recDiscount = discountLabel(product.oldPrice, product.price);
                return (
                  <Link key={`cart-rec-${product._id}`} href={`/${product.code || product._id}`} className="min-w-0 bg-white">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image src={normalizeCartImage(product.image)} alt={product.title || "Producto"} fill className="object-cover" />
                    </div>
                    <div className="px-2 py-2">
                      <p className="line-clamp-1 text-sm text-gray-700">{product.title || "Producto"}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-900">
                        ★★★★★ <span className="text-gray-500">ventas</span>
                      </div>
                      <div className="mt-1 flex min-w-0 items-end gap-1">
                        {recDiscount && <span className="rounded border border-amazon_blue px-1 text-xs font-bold text-amazon_blue">{recDiscount}</span>}
                        <span className="min-w-0 flex-1 text-lg font-black text-amazon_blue">
                          <FormattedPrice amount={Number(product.price || 0)} />
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            dispatch(addToCart({
                              _id: product._id,
                              brand: product.brand,
                              category: product.category,
                              description: product.description,
                              image: product.image,
                              isNew: product.isNew,
                              oldPrice: product.oldPrice,
                              price: Number(product.price || 0),
                              title: product.title,
                              quantity: 1,
                            }));
                          }}
                          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-950 bg-white text-gray-950"
                          aria-label="Agregar al carrito"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>

          <div className="mx-auto hidden w-full max-w-[480px] grid-cols-1 gap-2 px-2.5 pt-2.5 md:grid md:max-w-6xl md:px-0 md:pt-0 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-3">
            <section className="bg-white p-4 md:rounded-none md:p-0">
              <div className="hidden items-center justify-between border-b border-gray-300 px-4 py-3 md:flex">
                <h1 className="text-2xl font-black text-gray-950 md:text-3xl">Carro de Compras</h1>
                <span className="hidden pr-14 text-lg text-gray-950 md:block">Precio</span>
              </div>

              <div className="space-y-4 md:space-y-0">
                {cartItems.map((item: StoreProduct) => (
                  <CartProduct key={item.cartKey || item._id} item={item} />
                ))}
              </div>

              <div className="mt-4 hidden flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:flex">
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

            <aside className="md:static md:z-auto">
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

          {mounted
            ? createPortal(
                <aside
                  className="md:hidden"
                  style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    width: "100%",
                  }}
                >
                  <div className="flex w-full items-center gap-3 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_18px_rgba(17,24,39,0.12)]">
                    <div className="min-w-0 flex-1">
                      {hasCartDiscount && (
                        <p className="text-sm text-gray-500 line-through">
                          <FormattedPrice amount={originalTotal} />
                        </p>
                      )}
                      <p className="text-2xl font-black leading-none text-amazon_blue">
                        <FormattedPrice amount={totals.total + shippingAmount} />
                      </p>
                    </div>
                    <Link
                      href="/checkout"
                      className="flex h-14 min-w-[220px] items-center justify-center rounded-full bg-amazon_blue px-5 text-base font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)]"
                    >
                      Pagar ({selectedCount})
                    </Link>
                  </div>
                </aside>,
                document.body
              )
            : null}

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
