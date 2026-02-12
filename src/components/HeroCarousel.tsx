import { Carousel } from "react-responsive-carousel";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    title: "Resina epóxica 1 en 1",
    subtitle: "Resina para elaboración de proyectos personalizados en resina",
    href: "/categoria/resina",
    image: "/sliderImg_2.svg"
  },

 {
    title: "Nueva Ecoresina Ecológica",
    subtitle: "Resina ecológica no tóxica para proyectos resineros artesanales",
    href: "/categoria/resina",
    image: "/sliderImg_3.svg",
  },

  {
    title: "Novedades Navideñas",
    subtitle: "Descubre nuestras novedades de temporada navideña 2025",
    href: "/categoria/resina",
    image: "/sliderImg_6.svg",
  },


  {
    title: "Moldes de silicona",
    subtitle: "Geométricos, personalizados y alta durabilidad",
    href: "/categoria/moldes-de-silicona",
    bg: "bg-amazon_blue"
  },
  {
    title: "Pigmentos Perlados",
    subtitle: "Pigmentos perlados en polvo para colorear piezas",
    href: "/categoria/pigmentos",
    image: "/sliderImg_1.svg"
  }
];

export default function HeroCarousel() {
  return (
    <Carousel autoPlay infiniteLoop showStatus={false} showIndicators showThumbs={false} interval={5000}>
      {slides.map((s) => {
        const img: any = (s as any).image || (s as any).images;
        const gradient = (s as any).bg ? (s as any).bg : "";
        return (
          <div key={s.title} className={`relative overflow-hidden rounded-xl min-h-[240px] md:min-h-[320px] lg:min-h-[384px] border border-gray-200`}>
            {img && (
              <Image
                src={img}
                alt={s.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
              />
            )}
            {gradient ? (
              <div className={`absolute inset-0 ${gradient} ${img ? "opacity-50" : "opacity-100"}`}></div>
            ) : (
              img ? <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div> : null
            )}
            <div className="absolute inset-0 z-10 flex items-center justify-start text-white">
              <div className="w-full max-w-4xl px-6 md:px-12 lg:px-16 py-6 text-left">
                <span className="inline-block text-xs font-semibold bg-amazon_yellow text-black px-2 py-1 rounded">Destacado</span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.45)" }}>{s.title}</h2>
                <p className="mt-2 text-sm md:text-lg opacity-95" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}>{s.subtitle}</p>
                <Link href={s.href} className="inline-block mt-4 px-4 py-2 rounded bg-amazon_yellow text-black hover:brightness-95 font-semibold text-sm">Ver productos</Link>
              </div>
            </div>
          </div>
        );
      })}
    </Carousel>
  );
}
