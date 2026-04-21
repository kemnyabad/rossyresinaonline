import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
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
    { label: "Blog", href: "/blog" },
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
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa un correo válido."); return; }
    try {
      setSending(true);
      setError("");
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "No se pudo completar."); return; }
      setDone(true);
      setEmail("");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="w-full bg-[#0B0D12] text-white border-t border-white/5">

      {/* Newsletter banner */}
      <div className="border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Club Rossy Resina</p>
              <h3 className="mt-1 text-2xl font-black text-white tracking-tighter">Únete para ofertas y nuevos sorteos</h3>
              <p className="mt-1 text-sm text-white/40 font-medium">Sé el primero en enterarte de los próximos premios.</p>
            </div>
            {done ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircleIcon className="w-5 h-5" />
                ¡Suscripción completada!
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex w-full max-w-md gap-3">
                <div className="relative flex-1 group">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[#6E2CA1] to-[#cb299e] text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-60 flex items-center gap-2 shrink-0"
                >
                  {sending ? "..." : <><span>Unirme</span><ArrowRightIcon className="w-4 h-4 stroke-[3]" /></>}
                </button>
              </form>
            )}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#6E2CA1] to-[#cb299e] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-purple-900/20">RR</div>
              <div>
                <p className="font-black text-white text-xl leading-none tracking-tighter uppercase">Rossy Resina</p>
                <p className="text-[10px] text-purple-500 font-bold tracking-[0.2em] uppercase mt-0.5">Sorteos Legales</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/40 leading-relaxed max-w-xs font-medium">
              La plataforma número #1 en Perú para amantes de la resina. Sorteos transparentes, insumos de alta calidad y comunidad creativa.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/40">
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-4 h-4 shrink-0 text-purple-500" />
                <span>Lima, Perú</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 shrink-0 text-purple-500" />
                <span>+51 966 357 648</span>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 shrink-0 text-purple-500" />
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Navegación</p>
            <ul className="space-y-2.5">
              {LINKS.tienda.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-purple-400 transition flex items-center gap-1.5 group font-medium">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-purple-500" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Ayuda</p>
            <ul className="space-y-2.5">
              {LINKS.soporte.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-purple-400 transition flex items-center gap-1.5 group font-medium">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-purple-500" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Comunidad</p>
            <ul className="space-y-2.5">
              {LINKS.comunidad.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-purple-400 transition flex items-center gap-1.5 group font-medium">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-purple-500" />
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
            <Link href="/faq" className="hover:text-purple-400 transition">Centro de Ayuda</Link>
            <Link href="/about-us" className="hover:text-purple-400 transition">Sobre Nosotros</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
