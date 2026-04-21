import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";
import { TicketIcon, TrophyIcon, InformationCircleIcon, ArrowLeftIcon, ArrowRightIcon, ShoppingCartIcon, FireIcon, Bars3Icon, ShieldCheckIcon, ClockIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

import logo from "../images/logo.jpg";

interface Rifa {
  id: string;
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
  prizes?: string;
  totalNumbers: number;
  pricePerNumber: number;
  startDate: string;
  endDate: string;
  rules: string;
  soldCount: number;
  availableNumbers: number;
  prizeImages?: Array<{ url: string; alt?: string } | string>;
}

interface RifaNumbersData {
  tickets: Array<{
    id: string;
    number: number;
    status: string;
    buyerName?: string;
    buyerEmail?: string;
  }>;
  total: number;
}

interface BannerSlide {
  type: 'image' | 'text';
  url?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  gradient?: string;
}

// Componente Navbar para RifasPage
const RifasNavbar = ({ onBack, isSelected, router }: {
  onBack: () => void, 
  isSelected: boolean,
  router: any 
}) => (
  <nav className="sticky top-0 z-[60] bg-white border-b border-purple-100 px-4 py-4 shadow-sm">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={onBack}>
        <img
          src={logo.src}
          alt="Logo Rossy Resina"
          width={logo.width}
          height={logo.height}
          className="h-10 w-auto rounded-xl shadow-sm object-contain transition-all duration-300 group-hover:scale-110"
        />
        <div className="flex flex-col -space-y-1">
          <span className="font-black text-slate-950 tracking-tighter text-2xl uppercase">Rossy Resina</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E2CA1] animate-pulse" />
            <span className="text-[9px] font-bold text-[#6E2CA1] tracking-[0.3em] uppercase">Sorteos Premium</span>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        <button onClick={() => router.push('/')} className="hover:text-purple-600 transition-colors">Tienda</button>
        <button onClick={onBack} className={`${!isSelected ? 'text-purple-600 underline decoration-2 underline-offset-[12px]' : ''} hover:text-purple-600 transition-colors`}>Sorteos</button>
        <button className="hover:text-purple-600 transition-colors">Ganadores</button>
        <button onClick={() => router.push('/contact')} className="hover:text-purple-600 transition-colors">Ayuda</button>
      </div>
      <button className="bg-slate-900 text-white px-7 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-slate-200">Mi Cuenta</button>
    </div>
  </nav>
);

// Componente Footer interno para RifasPage
const LocalFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-white text-gray-800 border-t border-purple-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna 1: Marca */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#6E2CA1] via-[#cb299e] to-[#6E2CA1] flex items-center justify-center text-white font-black text-lg shadow-md">
              RR
            </div>
            <span className="font-black text-slate-900 text-xl uppercase">Rossy Resina</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Participa con total seguridad. Realizamos sorteos 100% transparentes con ganadores reales y entregas garantizadas.
          </p>
        </div>

        {/* Columna 2: Enlaces de ayuda */}
        <div>
          <h4 className="text-[#6E2CA1] font-bold text-sm uppercase tracking-wider mb-4">Ayuda</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Inicio</Link></li>
            <li><Link href="/account" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Mis Tickets</Link></li>
            <li><Link href="/terms" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Términos y Condiciones</Link></li>
            <li><Link href="/faq" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        {/* Columna 3: Redes Sociales y Contacto */}
        <div>
          <h4 className="text-[#6E2CA1] font-bold text-sm uppercase tracking-wider mb-4">Síguenos</h4>
          <div className="flex gap-4 mb-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaTiktok className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaFacebook className="w-5 h-5" />
            </a>
            <a href="https://wa.me/51966357648" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaWhatsapp className="w-5 h-5" />
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <EnvelopeIcon className="w-5 h-5 text-[#6E2CA1]" />
            <span className="text-sm">soporte@rossyresina.com</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
        Copyright © {year} - Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default function RifasPage() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [numbers, setNumbers] = useState<RifaNumbersData | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  // Carrusel para la página principal (antes de seleccionar una rifa)
  const [mainHeroIndex, setMainHeroIndex] = useState(0);
  const featuredRifas = rifas.slice(0, 3);

  useEffect(() => {
    if (featuredRifas.length <= 1 || selectedRifa) return;
    const itv = setInterval(() => {
      setMainHeroIndex((prev) => (prev + 1) % featuredRifas.length);
    }, 6000);
    return () => clearInterval(itv);
  }, [featuredRifas.length, selectedRifa]);

  const bannerSlides = useMemo<BannerSlide[]>(() => {
    if (!selectedRifa) return [];

    if (selectedRifa.prizeImages && selectedRifa.prizeImages.length > 0) {
      const normalized = selectedRifa.prizeImages
        .map((img) => {
          if (typeof img === 'string') {
            const url = img.trim();
            return url ? { url, alt: selectedRifa.title } : null;
          }
          const url = String(img?.url || '').trim();
          if (!url) return null;
          return { url, alt: img.alt || selectedRifa.title };
        })
        .filter(Boolean) as Array<{ url: string; alt: string }>;

      if (normalized.length > 0) {
        return normalized.map((img) => ({
          type: 'image',
          url: img.url,
          alt: img.alt || selectedRifa.title,
        }));
      }

      return [];
    }

    if (selectedRifa.videoUrl) {
      return [];
    }

    if (selectedRifa.image) {
      return [
        {
          type: 'image',
          url: selectedRifa.image,
          alt: selectedRifa.title,
        },
      ];
    }

    return [
      {
        type: 'text',
        title: selectedRifa.title,
        subtitle: 'Participa hoy y asegura tus números favoritos.',
        gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      },
      {
        type: 'text',
        title: `S/ ${parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)} por número`,
        subtitle: `${selectedRifa.availableNumbers} números libres para participar.`,
        gradient: 'from-rose-500 via-orange-400 to-amber-500',
      },
      {
        type: 'text',
        title: 'Compra rápida y segura',
        subtitle: 'Selecciona tus números y finaliza en pocos pasos.',
        gradient: 'from-cyan-500 via-sky-500 to-blue-600',
      },
    ];
  }, [selectedRifa]);

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
    try {
      const res = await fetch('/api/rifas');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRifas(data);
      } else {
        console.error('API returned non-array:', data);
        setRifas([]);
      }
    } catch (error) {
      console.error('Error fetching rifas:', error);
      setRifas([]);
    }
  };

  // Lógica para el auto-avance del slider de premios
  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [bannerSlides]);

  useEffect(() => {
    if (bannerSlides.length === 0) {
      setCurrentSlide(0);
      return;
    }
    setCurrentSlide((prev) => (prev >= bannerSlides.length ? 0 : prev));
  }, [bannerSlides.length]);

  const handleSelectRifa = async (rifa: Rifa) => {
    setSelectedRifa(rifa);
    setCurrentSlide(0);
    setSelectedNumbers([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/rifas/${rifa.id}/numbers?status=AVAILABLE&limit=1000`);
      const data = await res.json();
      setNumbers(data);
    } catch (error) {
      console.error('Error fetching numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNumber = (number: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  const handleBuy = async () => {
    if (selectedNumbers.length === 0) {
      alert('Selecciona al menos un número');
      return;
    }
    setShowBuyerForm(true);
  };

  const handleSubmitBuyer = async () => {
    if (!buyerData.name || !buyerData.email || !buyerData.phone) {
      alert('Completa todos los datos');
      return;
    }

    if (!selectedRifa) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rifas/${selectedRifa.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          buyerName: buyerData.name,
          buyerEmail: buyerData.email,
          buyerPhone: buyerData.phone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error);
        return;
      }

      const result = await res.json();
      router.push(`/rifas/${selectedRifa.id}/payment?tickets=${result.tickets.map((t: any) => t.id).join(',')}`);
    } catch (error) {
      console.error('Error buying:', error);
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRifa) {
    return (
      <div className="bg-[#FDFCFE] font-sans selection:bg-purple-100 selection:text-purple-900">
        <RifasNavbar onBack={() => setSelectedRifa(null)} isSelected={!!selectedRifa} router={router} /> {/* Pass router prop */}
        {featuredRifas.length > 0 && (
          <section className="relative h-[300px] md:h-[400px] overflow-hidden bg-slate-900">
            {featuredRifas.map((rifa, idx) => (
              <div key={rifa.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === mainHeroIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <img src={rifa.image} className="w-full h-full object-cover object-top opacity-70" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/20 to-transparent" />
                <div className="absolute inset-0 flex items-center px-6 md:px-20">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6E2CA1] to-[#cb299e] text-white text-[9px] font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-[0.25em] shadow-lg shadow-purple-500/30">
                      <FireIcon className="w-3 h-3" /> Sorteo en tendencia
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter mb-4">{rifa.title}</h2>
                    <p className="text-slate-200 text-xs md:text-sm mb-8 line-clamp-2 max-w-md font-medium leading-relaxed">{rifa.description}</p>
                    <button onClick={() => handleSelectRifa(rifa)} className="bg-white text-[#6E2CA1] px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#6E2CA1] hover:text-white transition-all shadow-xl hover:shadow-purple-500/20 active:scale-95">Participar Ahora</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-6 right-6 md:right-12 flex gap-2">
              {featuredRifas.map((_, i) => (
                <button key={i} onClick={() => setMainHeroIndex(i)} className={`h-2 rounded-full transition-all duration-500 ${mainHeroIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
              ))}
            </div>
          </section>
        )}

        {/* Steps Section - Estilo Yoki */}
        <section className="bg-white py-24 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <p className="text-[10px] font-black text-[#6E2CA1] uppercase tracking-[0.4em] mb-4">Guía de participación</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase">¿Cómo <span className="text-[#6E2CA1]">Comprar?</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { icon: TicketIcon, title: "1. Elige tus números", desc: "Entra al sorteo que más te guste y selecciona tus números de la suerte en la cartilla digital." },
                { icon: ShieldCheckIcon, title: "2. Paga con confianza", desc: "Realiza el pago vía Yape o transferencia y sube tu comprobante. Procesamos todo en segundos." },
                { icon: TrophyIcon, title: "3. ¡Gana premios!", desc: "Sigue nuestras transmisiones en vivo. ¡Podrías ser el próximo afortunado ganador!" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-purple-50 flex items-center justify-center text-purple-600 mb-8 border border-purple-100/50">
                    <step.icon className="w-10 h-10 text-[#6E2CA1]" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed px-6">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-24 bg-slate-50/30" id="sorteos">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6E2CA1] text-white text-[9px] font-black uppercase tracking-[0.25em] mb-6 shadow-lg shadow-purple-200">
                <ClockIcon className="w-4 h-4" /> Sorteos en vivo
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase">Próximos <span className="text-[#6E2CA1]">Sorteos</span></h2>
              <p className="text-slate-500 text-sm mt-4 font-medium tracking-tight">¡No te quedes fuera! Asegura tus números de la suerte.</p>
            </div>
          </div>

          {rifas.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No hay sorteos activos en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rifas.map((rifa) => {
                const sold = rifa.totalNumbers - rifa.availableNumbers;
                const progress = Math.round((sold / rifa.totalNumbers) * 100);

                return (
                  <div
                    key={rifa.id}
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-72 bg-slate-50 overflow-hidden">
                      {rifa.image && (
                        <img
                          src={rifa.image}
                          alt={rifa.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50">
                        <p className="text-[9px] font-black text-[#6E2CA1] uppercase tracking-[0.2em] leading-none mb-1">Ticket</p>
                        <p className="text-lg font-black text-slate-900 leading-none">S/ {parseFloat(rifa.pricePerNumber.toString()).toFixed(2)}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950/80 to-transparent">
                        <div className="flex justify-between items-end text-white mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{progress}% Vendido</span>
                          <span className="text-[10px] font-bold opacity-70">{rifa.availableNumbers} Libres</span>
                        </div>
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#6E2CA1] to-[#cb299e] transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-black text-slate-950 leading-tight mb-3 group-hover:text-[#6E2CA1] transition-colors tracking-tighter uppercase"> {rifa.title} </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-10 font-medium leading-relaxed"> {rifa.description} </p>
                      <button
                        onClick={() => handleSelectRifa(rifa)}
                        disabled={rifa.availableNumbers === 0}
                        className="w-full py-4 px-6 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#6E2CA1] transition-all duration-300 disabled:bg-slate-50 disabled:text-slate-300 shadow-lg hover:shadow-purple-500/20"
                      >
                        {rifa.availableNumbers > 0 ? 'Comprar Tickets' : 'Agotado'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <LocalFooter />
      </div>
    );
  }

  const soldCount = selectedRifa.totalNumbers - selectedRifa.availableNumbers;
  const progress = Math.round((soldCount / selectedRifa.totalNumbers) * 100);
  const totalAmount = selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString());
  const prizeLines = selectedRifa.prizes
    ? selectedRifa.prizes.split('\n').map((line) => line.replace(/[✨🏆⭐•-]/g, '').trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-[#FDFCFE] font-sans selection:bg-purple-100">
      <RifasNavbar onBack={() => setSelectedRifa(null)} isSelected={!!selectedRifa} router={router} /> {/* Pass router prop */}
      <div className="py-12 px-4 md:px-6 max-w-7xl mx-auto mb-20">
        <button
          onClick={() => {
            setSelectedRifa(null);
            setSelectedNumbers([]);
            setShowBuyerForm(false);
            setCurrentSlide(0);
          }}
          className="mt-8 mb-12 inline-flex items-center gap-3 text-slate-400 hover:text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Volver al listado
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 aspect-[16/10] mb-8 shadow-2xl">
                {bannerSlides.length > 0 ? (
                  <>
                    {bannerSlides[currentSlide].type === 'image' ? (
                      <div
                        className="w-full h-full bg-center bg-cover transition-all duration-1000"
                        style={{ backgroundImage: `url(${bannerSlides[currentSlide].url})` }}
                      >
                      </div>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${bannerSlides[currentSlide].gradient} p-12 flex flex-col items-center justify-center text-center`}>
                        <h2 className="text-white text-3xl font-black mb-4 tracking-tighter">{bannerSlides[currentSlide].title}</h2>
                        <p className="text-white/80 font-bold uppercase tracking-widest text-xs">{bannerSlides[currentSlide].subtitle}</p>
                      </div>
                    )}

                    {bannerSlides.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
                          }}
                          className="absolute top-1/2 -translate-y-1/2 left-3 md:left-4 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
                          }}
                          className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                          {bannerSlides.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentSlide(i)}
                              className={`h-1.5 rounded-full transition-all ${currentSlide === i ? 'w-7 bg-white' : 'w-2 bg-white/55'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold">
                    Sin imágenes del slider
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="inline-flex self-start px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Sorteo en Curso
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-950 leading-[1.1] tracking-tighter mb-4 uppercase">
                  {selectedRifa.title}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{selectedRifa.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-100 p-6 bg-white">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-2 tracking-widest">Precio Ticket</p>
                  <p className="text-2xl font-black text-slate-900">S/ {parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 p-6 bg-white">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-2 tracking-widest">Libres</p>
                  <p className="text-2xl font-black text-[#6E2CA1]">{selectedRifa.availableNumbers}</p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-purple-50 border border-purple-100 p-8">
                <div className="flex items-center justify-between text-[10px] font-black text-[#6E2CA1] mb-5 uppercase tracking-[0.25em]">
                  <span>Estado de Venta</span>
                  <span className="bg-white px-3 py-1 rounded-lg shadow-sm">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-[#6E2CA1] to-[#cb299e] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(110,44,161,0.3)]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {prizeLines.length > 0 && (
                <div className="rounded-[2rem] border border-amber-100 bg-amber-50/40 p-8">
                  <p className="text-[10px] uppercase text-amber-600 font-black tracking-[0.2em] mb-5 flex items-center gap-2"> <TrophyIcon className="w-4 h-4"/> Premios del Sorteo</p>
                  <div className="space-y-3">
                    {prizeLines.slice(0, 5).map((line, idx) => (
                      <p key={idx} className="text-xs font-bold text-amber-900 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-14 shadow-xl shadow-slate-200/30">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">Cartilla <span className="text-[#6E2CA1]">Virtual</span></h3>
                <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em]">{selectedNumbers.length} seleccionados</span>
                </div>
              </div>
              <div className="max-h-[800px] overflow-y-auto pr-6 custom-scrollbar">
                {!loading ? (
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
                    {Array.from({ length: selectedRifa.totalNumbers }, (_, i) => i + 1).map((num) => {
                      const ticket = numbers?.tickets.find((t) => t.number === num);
                      const isSelected = selectedNumbers.includes(num);
                      const isAvailable = ticket?.status === 'AVAILABLE';

                      return (
                        <button
                          key={num}
                          onClick={() => {
                            if (isAvailable) toggleNumber(num);
                          }}
                          disabled={!isAvailable}
                          className={`aspect-square rounded-xl font-bold text-[11px] sm:text-sm transition-all duration-300 transform active:scale-90 border-2 ${
                            isSelected
                              ? 'bg-[#6E2CA1] text-white border-[#6E2CA1] shadow-xl shadow-purple-200 scale-110 z-10'
                              : isAvailable
                              ? 'bg-white text-slate-950 border-slate-50 hover:border-purple-300 hover:text-[#6E2CA1]'
                              : 'bg-slate-50 text-slate-200 border-transparent cursor-not-allowed opacity-30'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                ) : ( <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div> )}
              </div>
            </div>

            {selectedRifa.videoUrl && (
              <div className="mt-8 rounded-3xl overflow-hidden border border-slate-100 bg-slate-950 shadow-lg">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-white font-black">Video Presentación</p>
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <video src={selectedRifa.videoUrl} controls className="w-full aspect-video" />
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 lg:sticky lg:top-24 shadow-xl shadow-slate-200/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl rounded-full -mr-16 -mt-16 opacity-50"></div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#6E2CA1] font-black mb-10 flex items-center gap-2 relative z-10"><ShoppingCartIcon className="w-4 h-4"/> Mi Compra</p>
              
              <div className="space-y-6 mb-12 relative z-10">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Tickets</span>
                  <span className="text-slate-900">{selectedNumbers.length} und.</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-50 pt-6">
                  <span className="text-[10px] font-black text-[#6E2CA1] uppercase tracking-widest mb-1">Total Final</span>
                  <span className="text-4xl font-black text-slate-950 leading-none">S/ {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest mb-12 text-slate-400 relative z-10">
                <div className="flex items-center gap-2"> <span className="w-2 h-2 bg-white border-2 border-slate-100 rounded-full" /> Libre </div>
                <div className="flex items-center gap-2 text-[#6E2CA1]"> <span className="w-2 h-2 bg-[#6E2CA1] rounded-full" /> Tu selección </div>
                <div className="flex items-center gap-2 opacity-30"> <span className="w-2 h-2 bg-slate-200 rounded-full" /> Ocupado </div>
              </div>

              <div className="relative z-10">
                <button
                  onClick={() => {
                    if (selectedNumbers.length === 0) {
                      alert('Selecciona al menos un número');
                      return;
                    }
                    router.push(`/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`);
                  }}
                  disabled={selectedNumbers.length === 0 || loading}
                  className="w-full py-5 px-6 bg-slate-950 text-white rounded-full font-black text-[11px] uppercase tracking-[0.25em] hover:bg-[#6E2CA1] shadow-2xl shadow-purple-500/20 transition-all flex items-center justify-center gap-3 disabled:bg-slate-50 disabled:text-slate-300"
                >
                  Reservar tickets <ShoppingCartIcon className="w-5 h-5"/>
                </button>
              </div>

              {selectedRifa.rules && (
                <div className="mt-12 pt-8 border-t border-slate-50 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <InformationCircleIcon className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar font-medium">{selectedRifa.rules}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LocalFooter />
    </div>
  );
}
