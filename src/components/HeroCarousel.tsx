import Link from "next/link";
import {
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  PhotoIcon,
  CodeBracketIcon,
  CommandLineIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
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
    <div className="-mt-px grid overflow-hidden rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-[0_1px_3px_rgba(17,24,39,0.08)] sm:grid-cols-2 xl:grid-cols-4">
      {quickLinks.map(({ href, title, text, icon: Icon, accent, bg }) => (
        <Link
          key={href}
          href={href}
          className="group flex min-h-[86px] items-center gap-3 border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50 sm:border-r xl:border-b-0 xl:last:border-r-0"
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${bg} ${accent}`}>
            <Icon className="h-6 w-6" />
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

  const banner = {
    title: "Banner en construcción",
    text: "Pronto disponible. Sigue disfrutando de nuestra web.",
    href: "/productos",
    cta: "Ver productos",
  };

  return (
    <section className="w-full">
      <div className="grid min-h-[420px] grid-cols-1 gap-4">
        <div className="min-w-0">
          <div className="relative min-h-[420px] overflow-hidden rounded-t-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(17,24,39,0.08)] lg:h-[420px] lg:min-h-0">
            <Link href={banner.href} className="absolute inset-0 z-[1]" aria-label={banner.cta} />
            <div className="relative z-[2] grid min-h-[420px] items-center gap-8 px-5 py-5 sm:px-7 md:px-8 lg:absolute lg:inset-0 lg:min-h-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.8fr)] lg:px-10 lg:py-5">
              <div className="flex h-full max-w-[620px] flex-col justify-between pl-0 lg:pl-2">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#e4147f] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#e4147f]">
                    <RocketLaunchIcon className="h-4 w-4" />
                    Pronto disponible
                  </div>
                  <h1 className="rr-type-display max-w-[600px] text-[30px] md:text-[36px] lg:text-[44px]">
                    {banner.title}
                  </h1>
                  <p className="rr-type-body mt-4 max-w-[520px] text-[15px] md:text-[17px] lg:mt-5 lg:text-[18px]">
                    {banner.text}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 lg:mt-8 lg:gap-5">
                    <span className="inline-flex h-12 items-center rounded-md bg-amazon_blue px-6 text-sm font-semibold text-white">
                      {banner.cta}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden min-h-[300px] items-center justify-center lg:flex">
                <div className="relative h-[270px] w-full max-w-[430px]">
                  <div className="absolute left-8 top-5 h-44 w-72 rounded-md border border-gray-300 bg-white">
                    <div className="flex h-10 items-center gap-2 border-b border-gray-100 px-4">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e4147f]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#86b817]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10aebb]" />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="h-3 w-36 rounded-full bg-slate-200" />
                      <div className="h-3 w-52 rounded-full bg-[#e4147f]" />
                      <div className="h-3 w-44 rounded-full bg-[#10aebb]" />
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <span className="h-12 rounded-md border border-gray-200 bg-white" />
                        <span className="h-12 rounded-md border border-gray-200 bg-white" />
                        <span className="h-12 rounded-md border border-gray-200 bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-2 top-16 flex h-20 w-20 items-center justify-center rounded-md bg-[#e4147f] text-white">
                    <CodeBracketIcon className="h-10 w-10" />
                  </div>
                  <div className="absolute bottom-8 left-0 flex h-16 w-16 items-center justify-center rounded-md bg-[#10aebb] text-white">
                    <CommandLineIcon className="h-8 w-8" />
                  </div>
                  <div className="absolute bottom-3 right-20 flex h-14 w-14 items-center justify-center rounded-md bg-[#86b817] text-white">
                    <WrenchScrewdriverIcon className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BannerQuickLinks />
        </div>

      </div>
    </section>
  );
}
