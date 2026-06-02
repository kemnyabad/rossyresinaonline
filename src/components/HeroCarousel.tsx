import Link from "next/link";
import {
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import type { ProductProps } from "../../type";

interface Props {
  productData?: ProductProps[];
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
  ofertasExpress?: { id: string; nombre: string; imagen: string }[];
}

const quickLinks = [
  {
    href: "/mayoristas",
    title: "Distribuidora resinera",
    text: "Compra y vende insumos",
    icon: BuildingStorefrontIcon,
    accent: "text-[#10aebb]",
    bg: "bg-white border-[#10aebb]",
  },
  {
    href: "/resiny",
    title: "Resiny",
    text: "Asistente de Rossy Resina",
    icon: ChatBubbleLeftRightIcon,
    accent: "text-[#e4147f]",
    bg: "bg-white border-[#e4147f]",
  },
  {
    href: "/escuela",
    title: "Escuela de formación resinera",
    text: "Aprende y emprende",
    icon: AcademicCapIcon,
    accent: "text-[#86b817]",
    bg: "bg-white border-[#86b817]",
  },
  {
    href: "/categoria/creaciones",
    title: "Galería recuerdos personalizados",
    text: "Ideas y creaciones",
    icon: PhotoIcon,
    accent: "text-[#10aebb]",
    bg: "bg-white border-[#10aebb]",
  },
];

function BannerQuickLinks() {
  return (
    <div className="grid overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(17,24,39,0.08)] sm:grid-cols-2 xl:grid-cols-4">
      {quickLinks.map(({ href, title, text, icon: Icon, accent, bg }) => (
        <Link
          key={href}
          href={href}
          className="group flex min-h-[86px] items-center gap-3 border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50 sm:border-r xl:border-b-0 xl:last:border-r-0"
        >
          <span className={`rr-icon-float flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${bg} ${accent}`}>
            <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-tight text-gray-950 transition-colors group-hover:text-amazon_blue">
              {title}
            </span>
            <span className="mt-1 block truncate text-xs font-medium text-gray-500">
              {text}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
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

  return (
    <section className="w-full">
      <BannerQuickLinks />
    </section>
  );
}
