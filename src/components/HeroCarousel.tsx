import type { ProductProps } from "../../type";

interface Props {
  productData?: ProductProps[];
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
}

export default function HeroCarousel({
  productData = [],
  remateProducts = [],
  topVisitedProducts = [],
  moldProducts = [],
}: Props) {
  void productData;
  void remateProducts;
  void topVisitedProducts;
  void moldProducts;

  return null;
}
