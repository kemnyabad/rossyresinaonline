import React from "react";
import Image from "next/image";
import { ProductProps } from "../../type";
import { HiShoppingCart } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";
import FormattedPrice from "./FormattedPrice";
import { useDispatch } from "react-redux";
import { addToCart, addToFavorite } from "@/store/nextSlice";
import Link from "next/link";

const Products = ({ productData, gridClass = "" }: any) => {
  const dispatch = useDispatch();
  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };
  const productSlug = (code?: string, id?: number) => {
    return code ? `/${code}` : `/${id}`;
  };
  return (
    <div className={`w-full px-2 md:px-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 ${gridClass}`}>
      {productData.map(
        ({
          _id,
          code,
          title,
          brand,
          category,
          description,
          image,
          isNew,
          oldPrice,
          price,
        }: ProductProps) => (
          <div
            key={_id}
            className="w-full bg-white text-black p-3 md:p-4 border border-gray-200 rounded-lg group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-full h-44 sm:h-52 md:h-56 lg:h-60 relative bg-white flex items-center justify-center">
              <Link
                href={{
                  pathname: productSlug(code, _id),
                  query: {
                    _id: _id,
                    brand: brand,
                    category: category,
                    description: description,
                    image: image,
                    isNew: isNew,
                    oldPrice: oldPrice,
                    price: price,
                    title: title,
                  },
                }}
              >
                <Image
                  src={normImg(image)}
                  alt={title || "Producto"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain md:object-cover md:scale-90 md:hover:scale-100 transition-transform duration-300"
                />
              </Link>
              <div className="w-12 h-24 absolute bottom-6 right-0 border border-gray-300 bg-white rounded-md flex flex-col translate-x-20 group-hover:translate-x-0 transition-transform duration-300">
                <span
                  onClick={() =>
                    dispatch(
                      addToCart({
                        _id: _id,
                        brand: brand,
                        category: category,
                        description: description,
                        image: image,
                        isNew: isNew,
                        oldPrice: oldPrice,
                        price: price,
                        title: title,
                        quantity: 1,
                      })
                    )
                  }
                  className="w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center text-xl bg-transparent hover:bg-amazon_yellow cursor-pointer duration-300"
                >
                  <HiShoppingCart />
                </span>
                <span
                  onClick={() =>
                    dispatch(
                      addToFavorite({
                        _id: _id,
                        brand: brand,
                        category: category,
                        description: description,
                        image: image,
                        isNew: isNew,
                        oldPrice: oldPrice,
                        price: price,
                        title: title,
                        quantity: 1,
                      })
                    )
                  }
                  className="w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center text-xl bg-transparent hover:bg-amazon_yellow cursor-pointer duration-300"
                >
                  <FaHeart />
                </span>
              </div>
              {typeof oldPrice === "number" && oldPrice > price && (
                <p className="absolute top-2 left-2 text-amazon_blue bg-amazon_yellow font-semibold text-[10px] px-2 py-1 rounded">
                  Ahorra <FormattedPrice amount={oldPrice - price} />
                </p>
              )}
            </div>
            <hr />
            <div className="px-2 py-3 flex flex-col gap-1">
              <p className="text-[11px] text-gray-500 tracking-wide">{category}</p>
              {code && <p className="text-[11px] text-gray-500">Código: {code}</p>}
              <p className="text-sm md:text-base font-medium line-clamp-2 min-h-[40px]">{title}</p>
              <p className="flex items-center gap-2">
                {typeof oldPrice === "number" && oldPrice > price && (
                  <span className="text-xs line-through text-gray-500">
                    <FormattedPrice amount={oldPrice} />
                  </span>
                )}
                <span className="text-amazon_blue font-semibold text-base">
                  <FormattedPrice amount={price} />
                </span>
              </p>
              <p className="text-xs text-gray-600 text-justify line-clamp-2">
                {description.substring(0, 120)}
              </p>
              <button
                onClick={() =>
                  dispatch(
                    addToCart({
                      _id: _id,
                      brand: brand,
                      category: category,
                      description: description,
                      image: image,
                      isNew: isNew,
                      oldPrice: oldPrice,
                      price: price,
                      title: title,
                      quantity: 1,
                    })
                  )
                }
                className="h-9 font-semibold text-sm rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black duration-300 mt-2"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Products;
