import Link from "next/link";
import logoImg from '../images/logo.jpg';
import { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

const LINKS = {
  tienda: [
    { label: "Inicio", href: "/" },
    { label: "Todos los productos", href: "/productos" },
    { label: "Resina epóxica", href: "/categoria/resina" },
    { label: "Moldes de silicona", href: "/categoria/moldes-de-silicona" },
    { label: "Pigmentos", href: "/categoria/pigmentos" },
    { label: "Ofertas", href: "/productos?ofertas=1" },
  ],
  soporte: [
    { label: "Preguntas frecuentes", href: "/faq" },
    { label: "Contacto", href: "/contact" },
    { label: "Rastrear pedido", href: "/track-orders" },
    { label: "Términos y condiciones", href: "/terms" },
    { label: "Política de privacidad", href: "/privacy" },
    { label: "Sobre nosotros", href: "/about-us" },
  ],
  comunidad: [
    { label: "Sorteos resineros", href: "/sorteos-resineros" },
    { label: "Comunidad", href: "/comunidad" },
    { label: "Capacitaciones", href: "/capacitaciones" },
  ],
};

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebook },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "WhatsApp", href: "https://wa.me/51966357648", icon: FaWhatsapp },
  { label: "TikTok", href: "https://tiktok.com", icon: FaTiktok },
];

// Para evitar errores de hidratación con el año
const useCurrentYear = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);
  return year;
};

const Footer = () => {
  const year = useCurrentYear();

  return (
    <footer className="w-full bg-[#0B0D12] text-white border-t border-white/5">

      {/* Main footer */}
      <div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img 
                src={logoImg.src} 
                alt="Rossy Resina" 
                className="h-12 w-auto object-contain" 
              />
              <div>
                <p className="font-black text-white text-xl leading-none tracking-tighter uppercase">Rossy Resina</p>
                <p className="text-pink-400 font-black uppercase tracking-widest text-[10px] md:text-xs mt-1">
                  MOLDES • RESINA • PIGMENTOS
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/40 leading-relaxed max-w-xs font-medium">
              La plataforma número #1 en Perú para amantes de la resina. Sorteos transparentes, insumos de alta calidad y comunidad creativa.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/40">
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-4 h-4 shrink-0 text-pink-400" />
                <span>Lima, Perú</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 shrink-0 text-pink-400" />
                <span>+51 966 357 648</span>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 shrink-0 text-pink-400" />
                <span>contacto@rossyresina.com</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-6">Navegación</p>
            <ul className="space-y-2.5">
              {LINKS.tienda.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-pink-400 transition flex items-center gap-1.5 group font-medium">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-pink-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-6">Ayuda</p>
            <ul className="space-y-2.5">
              {LINKS.soporte.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-pink-400 transition flex items-center gap-1.5 group font-medium">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-pink-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-6">Comunidad</p>
            <ul className="space-y-2.5">
              {LINKS.comunidad.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-pink-400 transition flex items-center gap-1.5 group font-medium">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-pink-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <p className="font-medium">© {year} Rossy Resina. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/terms" className="hover:text-white/60 transition">Términos Legales</Link>
            <Link href="/faq" className="hover:text-pink-400 transition">Centro de Ayuda</Link>
            <Link href="/about-us" className="hover:text-pink-400 transition">Sobre Nosotros</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
