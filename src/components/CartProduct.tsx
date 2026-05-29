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
    <article className="bg-white md:border-b md:border-gray-200 md:px-4 md:py-4 md:last:border-b-0">
      <div className="grid grid-cols-[24px_108px_minmax(0,1fr)] gap-3 md:grid-cols-[220px_minmax(0,1fr)_150px] md:gap-3 lg:grid-cols-[220px_minmax(0,1fr)_150px]">
        <div className="flex items-center md:hidden">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amazon_blue text-xs font-black text-white">
            ✓
          </span>
        </div>
        <div className="flex gap-4">
          <div className="relative h-[120px] w-[108px] shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-48 md:w-48 md:rounded-none md:border md:border-gray-100 md:bg-white">
          <Image
            className="object-contain"
            fill
            src={imageSrc}
            alt={item.title || "Producto"}
            sizes="(max-width: 768px) 112px, 192px"
          />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-5 text-gray-950 md:text-xl md:font-black md:uppercase md:leading-tight md:tracking-wide">
            {item.title}
          </h2>
          <p className="mt-1.5 line-clamp-1 text-[13px] font-medium text-gray-500 md:text-base md:text-gray-700">
            {item.brand ? `${item.brand} · ` : ""}
            {item.category || "Producto Rossy Resina"}
          </p>
          <p className="mt-1 text-xl font-black text-amazon_blue md:hidden">
            <FormattedPrice amount={item.price} />
          </p>
          <div className="mt-4 hidden space-y-0.5 text-sm text-gray-800 md:block md:text-[15px]">
            <p>Origen: Perú</p>
            <p>Envío: Envío coordinado por WhatsApp</p>
            <p>
              Estado: <span className="font-bold">Nuevo</span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-sm md:mt-5 md:justify-start">
            <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-full border border-gray-200 bg-white text-gray-950 md:h-9 md:gap-3 md:rounded-md md:border-gray-300 md:bg-gray-50 md:px-3">
              <span className="hidden md:inline">Cantidad:</span>
              <button
                type="button"
                onClick={() => dispatch(decreaseQuantity({ _id: item._id }))}
                className="flex h-9 w-10 items-center justify-center text-gray-700 hover:bg-gray-100 md:h-6 md:w-6 md:rounded md:hover:bg-gray-200"
                aria-label="Disminuir cantidad"
              >
                <LuMinus className="h-4 w-4" />
              </button>
              <span className="min-w-[34px] text-center text-base font-semibold md:min-w-[18px] md:text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => dispatch(increaseQuantity({ _id: item._id }))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-amazon_blue text-white hover:brightness-95 md:h-6 md:w-6 md:rounded md:bg-transparent md:text-gray-700 md:hover:bg-gray-200"
                aria-label="Aumentar cantidad"
              >
                <LuPlus className="h-4 w-4" />
              </button>
            </div>
            <span className="hidden h-6 w-px bg-gray-200 sm:block" />
            <button
              type="button"
              onClick={() => dispatch(deleteProduct(item._id))}
              className="hidden shrink-0 font-medium text-orange-600 hover:text-orange-700 hover:underline md:inline"
              aria-label="Eliminar producto"
            >
              Eliminar
            </button>
          </div>
        </div>

        <div className="hidden text-left md:block md:text-right">
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
