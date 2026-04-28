import Image from "next/image";
import React from "react";
import FormattedPrice from "./FormattedPrice";
import { LuMinus, LuPlus } from "react-icons/lu";
import { useDispatch } from "react-redux";
import {
  decreaseQuantity,
  deleteProduct,
  increaseQuantity,
} from "@/store/nextSlice";
interface Item {
  brand: string;
  category: string;
  description: string;
  image: string;
  isNew: boolean;
  oldPrice?: number;
  price: number;
  title: string;
  _id: number | string;
  quantity: number;
}
interface cartProductsProps {
  item: Item;
}

const CartProduct = ({ item }: cartProductsProps) => {
  const dispatch = useDispatch();
  const hasDiscount = typeof item.oldPrice === "number" && item.oldPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round(((Number(item.oldPrice) - Number(item.price)) / Number(item.oldPrice)) * 100)
    : 0;
  const imageSrc = (() => {
    const s = String(item.image || "");
    let u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png";
  })();

  return (
    <article className="border-b border-gray-200 bg-white px-4 py-5 last:border-b-0 md:px-5">
      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)_180px] lg:grid-cols-[240px_minmax(0,1fr)_180px]">
        <div className="flex gap-4">
          <div className="relative h-32 w-28 shrink-0 overflow-hidden border border-gray-100 bg-white md:h-40 md:w-36">
          <Image
            className="object-contain"
            fill
            src={imageSrc}
            alt={item.title || "Producto"}
            sizes="(max-width: 768px) 112px, 144px"
          />
          </div>
          <div className="md:hidden">
            <p className="text-xs text-gray-500">Precio</p>
            <p className="font-semibold text-gray-950">
              <FormattedPrice amount={item.price} />
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black uppercase leading-tight tracking-wide text-gray-950 md:text-xl">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-gray-700 md:text-base">
            {item.brand ? `${item.brand} · ` : ""}
            {item.category || "Producto Rossy Resina"}
          </p>
          <div className="mt-5 space-y-1 text-sm text-gray-800 md:text-base">
            <p>Origen: Perú</p>
            <p>Envío: Envío coordinado por WhatsApp</p>
            <p>
              Estado: <span className="font-bold">Nuevo</span>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm">
            <div className="inline-flex h-9 shrink-0 items-center gap-3 rounded-md border border-gray-300 bg-gray-50 px-3 text-gray-950">
              <span>Cantidad:</span>
              <button
                type="button"
                onClick={() => dispatch(decreaseQuantity({ _id: item._id }))}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-700 hover:bg-gray-200"
                aria-label="Disminuir cantidad"
              >
                <LuMinus className="h-4 w-4" />
              </button>
              <span className="min-w-[18px] text-center font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => dispatch(increaseQuantity({ _id: item._id }))}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-700 hover:bg-gray-200"
                aria-label="Aumentar cantidad"
              >
                <LuPlus className="h-4 w-4" />
              </button>
            </div>
            <span className="hidden h-6 w-px bg-gray-200 sm:block" />
            <button
              type="button"
              onClick={() => dispatch(deleteProduct(item._id))}
              className="shrink-0 font-medium text-orange-600 hover:text-orange-700 hover:underline"
              aria-label="Eliminar producto"
            >
              Eliminar
            </button>
          </div>
        </div>

        <div className="text-left md:text-right">
          {hasDiscount && (
            <p className="text-sm text-gray-400 line-through">
              <FormattedPrice amount={item.oldPrice} />
            </p>
          )}
          <div className="mt-1 flex items-center gap-2 md:justify-end">
            <p className="text-lg text-gray-950">
              <FormattedPrice amount={item.price} />
            </p>
            {hasDiscount && (
              <span className="rounded-md bg-orange-600 px-2 py-1 text-sm font-bold text-white">
                -{discountPercent}%
              </span>
            )}
          </div>
          <p className="mt-3 text-base text-gray-950">x {item.quantity} unidad{item.quantity > 1 ? "es" : ""}</p>
          <p className="mt-1 text-xl font-black text-gray-950">
            <FormattedPrice amount={item.price * item.quantity} />
          </p>
        </div>
      </div>
    </article>
  );
};

export default CartProduct;
