import type { ProductProps } from "../../type";

interface Props {
  productData?: ProductProps[];
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
  ofertasExpress?: { id: string; nombre: string; imagen: string }[];
}

export default function HeroCarousel({
  productData = [],
  remateProducts = [],
  topVisitedProducts = [],
  moldProducts = [],
  ofertasExpress = [],
}: Props) {
  void productData;
  void remateProducts;
  void topVisitedProducts;
  void moldProducts;
  void ofertasExpress;

  return null;
}
