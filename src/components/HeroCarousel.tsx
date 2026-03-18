import Image from "next/image";
import Link from "next/link";
import type { ProductProps } from "../../type";

const banner = {
  title: "Banner principal",
  image: "/sliderImg_1.svg",
};

interface Props {
  remateProducts?: ProductProps[];
}

export default function HeroCarousel({ remateProducts = [] }: Props) {
  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };

  return (
    <div className="relative w-full min-h-[220px] md:min-h-[320px] lg:min-h-[380px] bg-[#b90000] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="100vw"
          className="object-contain md:object-cover object-center"
          priority
        />
      </div>

      {remateProducts.length > 0 && (
        <div className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 flex gap-2 md:gap-4">
          {remateProducts.slice(0, 2).map((p) => (
            <Link
              key={`remate-${p._id}`}
              href={`/${p.code || p._id}`}
              className="w-[118px] md:w-[220px] rounded-xl overflow-hidden bg-white/95 shadow-lg"
            >
              <div className="relative h-[94px] md:h-[170px]">
                {(() => {
                  const src = normImg(p.image);
                  const isReference =
                    !p.image ||
                    src.includes("sliderImg_") ||
                    src.includes("favicon-96x96.png") ||
                    src.includes("favicon");
                  if (isReference) {
                    return (
                      <div className="absolute inset-0 bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wide flex items-center justify-center">
                        Producto en Proceso
                      </div>
                    );
                  }
                  return (
                    <Image
                      src={src}
                      alt={p.title || "Producto en remate"}
                      fill
                      className="object-cover"
                    />
                  );
                })()}
                <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] md:text-xs text-white">
                  Anuncio
                </span>
              </div>
              <div className="px-2 md:px-3 py-1.5 md:py-2">
                <p className="text-[10px] md:text-xs text-gray-500 line-through">
                  {typeof p.oldPrice === "number" ? `S/ ${Number(p.oldPrice).toFixed(2)}` : ""}
                </p>
                <p className="text-base md:text-[34px] leading-none font-semibold text-gray-900">
                  S/ {Number(p.price || 0).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
