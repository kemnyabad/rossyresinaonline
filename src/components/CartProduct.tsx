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
  _id: number;
  quantity: number;
}
interface cartProductsProps {
  item: Item;
}

const CartProduct = ({ item }: cartProductsProps) => {
  const dispatch = useDispatch();
  return (
    <div className="bg-gray-100 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Image
        className="object-contain sm:object-cover w-24 h-24 sm:w-[150px] sm:h-[150px]"
        width={150}
        height={150}
        src={((): string => { const s = String(item.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()}
        alt="productImage"
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-3 sm:gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-base sm:text-lg font-semibold text-amazon_blue break-words">{item.title}</p>
          <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
          <p className="text-xs sm:text-sm text-gray-600">
            Precio unitario{" "}
            <span className="font-semibold text-amazon_blue">
              <FormattedPrice amount={item.price} />
            </span>
          </p>
          <div className="flex items-center gap-4 sm:gap-6 mt-1">
            <div className="flex items-center justify-between border border-gray-300 px-4 py-1 rounded-full w-28 shadow-lg shadow-gray-300">
              <span
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
                className="w-6 h-6 flex items-center justify-center rounded-full text-base bg-transparent hover:bg-gray-300 cursor-pointer"
              >
                <LuPlus />
              </span>
              <span>{item.quantity}</span>
              <span
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
                className="w-6 h-6 flex items-center justify-center rounded-full text-base bg-transparent hover:bg-gray-300 cursor-pointer"
              >
                <LuMinus />
              </span>
            </div>
            <div
              onClick={() => dispatch(deleteProduct(item._id))}
              className="flex items-center text-sm font-medium text-gray-400 hover:text-red-600 cursor-pointer duration-300"
            >
              <IoMdClose className="mt-[2px]" /> <p>Eliminar</p>
            </div>
          </div>
        </div>
        <div className="text-sm sm:text-lg font-semibold text-amazon_blue ml-auto sm:ml-0">
          <FormattedPrice amount={item.price * item.quantity} />
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
