import Image from "next/image";
import React from "react";
import FormattedPrice from "./FormattedPrice";
import { LuMinus, LuPlus } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
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
  const imageSrc = (() => {
    const s = String(item.image || "");
    let u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png";
  })();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white md:h-28 md:w-28">
          <Image
            className="object-cover"
            fill
            src={imageSrc}
            alt={item.title || "Producto"}
            sizes="(max-width: 768px) 96px, 112px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 md:text-base">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 md:text-sm">{item.description}</p>
          <p className="mt-1 text-xs text-gray-600 md:text-sm">
            Precio unitario{" "}
            <span className="font-semibold text-gray-900">
              <FormattedPrice amount={item.price} />
            </span>
          </p>

          <div className="mt-3 flex items-center gap-2 md:gap-3">
            <div className="flex h-10 items-center justify-between rounded-full border border-gray-300 bg-white px-3 w-[120px] shrink-0">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    decreaseQuantity({
                      _id: item._id,
                      brand: item.brand,
                      category: item.category,
                      description: item.description,
                      image: item.image,
                      isNew: item.isNew,
                      oldPrice: item.oldPrice,
                      price: item.price,
                      title: item.title,
                      quantity: 1,
                    })
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full text-base hover:bg-gray-100"
                aria-label="Disminuir cantidad"
              >
                <LuMinus />
              </button>
              <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    increaseQuantity({
                      _id: item._id,
                      brand: item.brand,
                      category: item.category,
                      description: item.description,
                      image: item.image,
                      isNew: item.isNew,
                      oldPrice: item.oldPrice,
                      price: item.price,
                      title: item.title,
                      quantity: 1,
                    })
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full text-base hover:bg-gray-100"
                aria-label="Aumentar cantidad"
              >
                <LuPlus />
              </button>
            </div>

            <button
              type="button"
              onClick={() => dispatch(deleteProduct(item._id))}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Eliminar producto"
            >
              <IoMdClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="ml-auto text-right">
          <p className="text-xs text-gray-500">Subtotal</p>
          <p className="text-lg font-semibold text-gray-900">
            <FormattedPrice amount={item.price * item.quantity} />
          </p>
        </div>
      </div>

    </div>
  );
};

export default CartProduct;
