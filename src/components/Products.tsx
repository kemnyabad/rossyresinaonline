import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ProductProps } from "../../type";
import { HiShoppingCart } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/nextSlice";
import Link from "next/link";
import FormattedPrice from "./FormattedPrice";

const Products = ({
  productData,
  gridClass = "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6",
}: any) => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState<
    Record<string, { salesCount: number; avgRating: number; reviewCount: number }>
  >({});
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

  const idsParam = useMemo(() => {
    const ids = (Array.isArray(productData) ? productData : [])
      .map((p: ProductProps) => String(p?._id ?? "").trim())
      .filter(Boolean);
    return Array.from(new Set(ids)).join(",");
  }, [productData]);

  useEffect(() => {
    if (!idsParam) {
      setStats({});
      return;
    }
    let active = true;
    fetch(`/api/products/stats?ids=${encodeURIComponent(idsParam)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (!active) return;
        setStats(data && typeof data === "object" ? data : {});
      })
      .catch(() => {
        if (!active) return;
        setStats({});
      });
    return () => {
      active = false;
    };
  }, [idsParam]);

  return (
    <div className={`w-full px-2 md:px-0 grid ${gridClass}`}>
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
        }: ProductProps) => {
          const itemStats = stats[String(_id)] || { salesCount: 0, avgRating: 0, reviewCount: 0 };
          return (
          <div key={_id} className="w-full bg-white text-black border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
            <div className="relative w-full h-44 sm:h-52 md:h-56 lg:h-60 bg-white rounded-lg overflow-hidden">
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
                className="absolute inset-0"
              >
                {(() => {
                  const imgSrc = normImg(image);
                  const isPlaceholder =
                    !image ||
                    String(image).trim() === "" ||
                    imgSrc.includes("favicon-96x96.png") ||
                    imgSrc.includes("favicon");
                  if (isPlaceholder) {
                    return (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                        Producto en Proceso
                      </div>
                    );
                  }
                  return (
                    <Image
                      src={imgSrc}
                      alt={title || "Producto"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover"
                    />
                  );
                })()}
              </Link>
            </div>
            <div className="pt-2 pb-1">
              <p className="text-xs text-gray-800 truncate">{title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">
                  <FormattedPrice amount={price} />
                </span>
                {typeof oldPrice === "number" && oldPrice > price && (
                  <span className="text-xs line-through text-gray-400">
                    <FormattedPrice amount={oldPrice} />
                  </span>
                )}
                <span className="text-xs text-gray-500">{itemStats.salesCount} ventas</span>
                <button
                  onClick={() => {
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
                    );
                  }}
                  className="ml-auto h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  aria-label="Agregar al carrito"
                >
                  <HiShoppingCart />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-0.5 text-xs text-gray-900">
                {[0, 1, 2, 3, 4].map((i) => (
                  <FaStar
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.round(itemStats.avgRating) ? "text-amber-500" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-1 text-[11px] text-gray-500">
                  {itemStats.reviewCount > 0
                    ? `${itemStats.avgRating.toFixed(1)} (${itemStats.reviewCount})`
                    : "Sin resenas"}
                </span>
              </div>
            </div>
          </div>
          );
        }
      )}
    </div>
  );
};

export default Products;
