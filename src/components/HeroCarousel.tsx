import Link from "next/link";
import Image from "next/image";
import type { ProductProps } from "../../type";

interface Props {
  productData?: ProductProps[];
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
  ofertasExpress?: { id: string; nombre: string; imagen: string }[];
}

const MOLDS_FLYER_IMAGE = "/banners/moldes-buen-precio.png";

export default function HeroCarousel(_props: Props) {
  return (
    <section className="relative w-full overflow-hidden">
      <Link
        href="/productos"
        aria-label="Ver productos"
        className="group relative block aspect-[1933/814] w-full overflow-hidden bg-pink-50"
      >
        <Image
          src={MOLDS_FLYER_IMAGE}
          alt="Moldes a buen precio"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-contain"
        />

      </Link>
    </section>
  );
}
