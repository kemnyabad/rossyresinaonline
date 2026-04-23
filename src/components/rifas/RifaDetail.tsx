'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ShoppingCartIcon, TrophyIcon, InformationCircleIcon, TicketIcon, ShieldCheckIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface RifaDetailProps {
  selectedRifa: any;
  numbers: any;
  selectedNumbers: number[];
  toggleNumber: (num: number) => void;
  loading: boolean;
  bannerSlides: any[];
  currentSlide: number;
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void;
  onBack: () => void;
  router: any;
}

interface BannerSlide {
  type: 'image' | 'text'; url?: string; alt?: string; title?: string; subtitle?: string; gradient?: string;
}

const RifaDetail = ({ 
  selectedRifa, 
  numbers, 
  selectedNumbers, 
  toggleNumber, 
  loading, 
  bannerSlides, 
  currentSlide, 
  setCurrentSlide, 
  onBack, 
  router 
}: RifaDetailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adActive, setAdActive] = useState(true);
  const [timer, setTimer] = useState(10);
  const [showSkipButton, setShowSkipButton] = useState(false);

  // Lógica de Cuenta Regresiva Profesionalizada (Neuromarketing)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-05-08T19:00:00');

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalAmount = selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString());
  const prizeLines = selectedRifa.prizes
    ? selectedRifa.prizes.split('\n').map((line: string) => line.replace(/[✨🏆⭐•-]/g, '').trim()).filter(Boolean)
    : [];

  // Bloqueo de scroll para ad
  useEffect(() => {
    if (adActive) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => { 
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [adActive]);

  useEffect(() => {
    if (adActive && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (adActive && timer === 0) {
      setShowSkipButton(true);
    }
  }, [adActive, timer, selectedRifa.videoUrl]);

  useEffect(() => {
    if (adActive && selectedRifa.videoUrl && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [adActive, selectedRifa.videoUrl]);

  const handleSkipAd = () => {
    if (videoRef.current) videoRef.current.pause();
    setAdActive(false);
  };

  if (adActive && selectedRifa.videoUrl) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-screen z-[9999] bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={selectedRifa.videoUrl}
          autoPlay loop playsInline preload="auto"
          className="w-full h-full object-contain"
          onEnded={handleSkipAd}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="absolute top-10 text-white text-lg md:text-3xl font-black animate-pulse drop-shadow-lg text-center px-4">
            El sorteo comenzará en {timer}s...
          </p>
        </div>
        {showSkipButton && (
          <button
            onClick={handleSkipAd}
            className="fixed bottom-10 right-6 z-[10000] px-8 py-4 bg-white text-[#6E2CA1] rounded-full font-black text-sm md:text-base tracking-wider shadow-2xl hover:scale-105 transition-all duration-300 pointer-events-auto"
          >
            Omitir anuncio y comprar tickets
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 overflow-y-auto h-[100dvh] w-full antialiased selection:bg-purple-100 tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="animate-in fade-in duration-500 py-6 px-4 md:px-8 max-w-7xl mx-auto pb-20">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-3 text-slate-400 hover:text-slate-950 font-black text-xs uppercase tracking-widest transition-all group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al listado
        </button>

        {/* 1. CRONÓMETRO GLOBAL - Elemento Principal de la Página */}
        <div className="p-4 md:p-8 text-center mb-6 relative">
          <p className="text-lg md:text-3xl font-black text-slate-950 uppercase tracking-[0.3em] mb-6" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
            ¡EL SORTEO COMIENZA EN:
          </p>
          
          <div className="flex justify-center gap-2 md:gap-4 mb-6">
            {[
              { label: 'DÍAS', value: timeLeft.days },
              { label: 'HORAS', value: timeLeft.hours },
              { label: 'MIN', value: timeLeft.minutes },
              { label: 'SEG', value: timeLeft.seconds, animate: true }
            ].map((unit, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="bg-purple-50 w-14 h-18 md:w-20 md:h-24 rounded-2xl flex items-center justify-center border border-purple-100/50 shadow-sm relative overflow-hidden">
                  <span 
                    className={`text-xl md:text-4xl lg:text-5xl font-black text-[#6E2CA1] z-10 transition-transform ${unit.animate ? 'animate-pulse' : ''}`} 
                    style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
                  >
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                  <div className="absolute w-full h-[1px] bg-purple-200/30 top-1/2 left-0 z-0" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm md:text-xl font-bold text-slate-600 uppercase tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
            📅 Fecha: <span className="text-slate-900 font-black">08 de Mayo 2026</span> | 🕖 Hora: 19:00 PM | 🔵 Vía Facebook Live
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA: Info + Timer Prof (Desktop/Mobile shared, responsive) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Carousel */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 aspect-[16/10] shadow-sm">
              {bannerSlides.length > 0 ? (
                <div className="w-full h-full">
                  {bannerSlides[currentSlide].type === 'image' ? (
                    <div
                      className="w-full h-full bg-center bg-cover transition-all duration-1000"
                      style={{ backgroundImage: `url(${bannerSlides[currentSlide].url})` }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${bannerSlides[currentSlide].gradient} p-12 flex flex-col items-center justify-center text-center text-white`}>
                      <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{bannerSlides[currentSlide].title}</h2>
                      <p className="font-bold uppercase tracking-widest text-sm opacity-80">{bannerSlides[currentSlide].subtitle}</p>
                    </div>
                  )}
                  {bannerSlides.length > 1 && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                      {bannerSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-10 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                  <PhotoIcon className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* CRONÓMETRO PROFESIONALIZADO - Impacto Neuromarketing */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-100">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> Activo Ahora
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-950 uppercase leading-tight tracking-tighter">
                {selectedRifa.title}
              </h1>
              {/* Precio/Disponibles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-100 p-6 bg-white shadow-sm hover:shadow-md transition-all hover:border-[#6E2CA1]/20">
                  <p className="text-xs uppercase text-slate-400 font-black mb-2 tracking-[0.2em]">Precio Ticket</p>
                  <p className="text-3xl md:text-4xl font-black text-slate-950 leading-none">S/ {parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 p-6 bg-white shadow-sm hover:shadow-md transition-all hover:border-[#6E2CA1]/20">
                  <p className="text-xs uppercase text-slate-400 font-black mb-2 tracking-[0.2em]">Libres</p>
                  <p className="text-3xl md:text-4xl font-black text-[#6E2CA1] leading-none">{selectedRifa.availableNumbers}</p>
                </div>
              </div>

              {/* Resumen Compra Desktop */}
              <div className="hidden lg:block bg-white rounded-[2rem] border-2 border-purple-100 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                  <ShoppingCartIcon className="w-6 h-6 text-[#6E2CA1]" />
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Resumen de Compra</h3>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-[#6E2CA1] uppercase tracking-widest">Total a Pagar</span>
                      <p className="text-5xl font-black text-slate-950 leading-none">S/ {totalAmount.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase">{selectedNumbers.length} Números</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (selectedNumbers.length === 0) return alert('¡Selecciona al menos un número antes de continuar!');
                    router.push(`/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`);
                  }}
                  disabled={selectedNumbers.length === 0 || loading}
                  className="w-full py-6 bg-gradient-to-r from-[#6E2CA1] to-purple-900 text-white rounded-2xl font-black text-lg uppercase tracking-[0.15em] hover:from-slate-900 hover:to-slate-800 shadow-2xl shadow-purple-200/50 transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-400 active:scale-[0.98]"
                >
                  PARTICIPAR AHORA
                  <ShoppingCartIcon className="w-6 h-6" />
                </button>
                <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-50">
                  <div className="p-2 bg-purple-50 rounded-lg"><ShieldCheckIcon className="w-5 h-5 text-[#6E2CA1]" /></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Garantía de Transparencia Rossy Resina</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cartilla - 10col Desktop, 5col Mobile con botones GRANDES */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-5 md:p-8 shadow-lg h-full flex flex-col min-h-[500px] mt-8 lg:mt-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Cartilla <span className="text-[#6E2CA1]">Virtual</span></h3>
                <div className="bg-gradient-to-r from-purple-500 to-[#6E2CA1] px-4 py-2 rounded-2xl border border-purple-200 flex items-center gap-2 shadow-md">
                  <span className="text-sm font-black text-white uppercase tracking-widest">
                    {selectedNumbers.length} Seleccionados
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                {!loading ? (
                  <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 md:gap-3">
                    {Array.from({ length: selectedRifa.totalNumbers }, (_, i) => i + 1).map((num) => {
                      const ticket = numbers?.tickets.find((t: any) => t.number === num);
                      const isSelected = selectedNumbers.includes(num);
                      const isAvailable = ticket?.status === 'AVAILABLE';

                      return (
                        <button
                          key={num}
                          onClick={() => isAvailable && toggleNumber(num)}
                          disabled={!isAvailable}
                          style={{ fontFamily: 'Arial, sans-serif' }}
                          className={`aspect-square rounded-2xl lg:rounded-xl font-bold transition-all duration-300 transform active:scale-95 border-3 flex items-center justify-center hover:shadow-md ${isSelected
                            ? 'bg-gradient-to-br from-[#6E2CA1] to-purple-900 text-white border-[#6E2CA1] shadow-lg shadow-purple-200/50 scale-105'
                            : isAvailable
                            ? 'bg-white/80 text-slate-950 border-slate-200 hover:border-[#6E2CA1] hover:bg-gradient-to-br hover:from-purple-50 hover:to-white shadow-sm hover:shadow-purple-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                          } ${!isAvailable ? 'text-sm' : 'text-lg md:text-base lg:text-sm p-3 md:p-2'}`}
                        >
                          {num.toString().padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E2CA1]"></div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
        
        {/* Resumen Mobile - AL FINAL, debajo cartilla */}
        <div className="lg:hidden space-y-6 mt-12">
          <div className="bg-white rounded-[2rem] border-2 border-purple-100 p-8 shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
              <ShoppingCartIcon className="w-6 h-6 text-[#6E2CA1]" />
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-[0.2em]">Resumen de Compra</h3>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-sm font-black text-[#6E2CA1] uppercase tracking-widest">Total a Pagar</span>
                  <p className="text-5xl font-black text-slate-950 leading-none">S/ {totalAmount.toFixed(2)}</p>
                </div>
                <span className="text-base font-bold text-slate-500 uppercase">{selectedNumbers.length} Números</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (selectedNumbers.length === 0) return alert('¡Selecciona al menos un número antes de continuar!');
                router.push(`/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`);
              }}
              disabled={selectedNumbers.length === 0 || loading}
              className="w-full py-6 bg-gradient-to-r from-[#6E2CA1] to-purple-900 text-white rounded-2xl font-black text-xl uppercase tracking-[0.1em] hover:from-slate-900 hover:to-slate-800 shadow-2xl shadow-purple-200/50 transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-400 active:scale-[0.98]"
            >
              PARTICIPAR AHORA
              <ShoppingCartIcon className="w-6 h-6" />
            </button>
            <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-50">
              <div className="p-2 bg-purple-50 rounded-lg"><ShieldCheckIcon className="w-5 h-5 text-[#6E2CA1]" /></div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Garantía de Transparencia Rossy Resina</p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <section className="mt-20 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl mx-4 lg:mx-0">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black text-[#6E2CA1] uppercase tracking-[0.4em] mb-4 bg-gradient-to-r from-[#6E2CA1] bg-clip-text">Instrucciones</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tighter">¿Cómo funciona <span className="text-[#6E2CA1]">el sorteo?</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: TicketIcon, title: "1. Elige tus números", desc: "Selecciona tus números de la suerte en nuestra cartilla virtual interactiva." },
              { icon: ShieldCheckIcon, title: "2. Envía tu pago", desc: "Paga vía Yape o transferencia y sube tu comprobante. Lo validamos en segundos." },
              { icon: TrophyIcon, title: "3. ¡Gana premios!", desc: "Sigue la transmisión en vivo y descubre si eres el próximo afortunado ganador." }
            ].map((step, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 hover:-translate-y-2 bg-gradient-to-b from-white to-slate-50/50">
                <div className="w-24 h-24 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-[#6E2CA1] mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg">
                  <step.icon className="w-10 h-10 md:w-8 md:h-8" />
                </div>
                <h4 className="text-lg md:text-sm font-black text-slate-950 uppercase tracking-tight mb-4 text-center">{step.title}</h4>
                <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 uppercase tracking-tight text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes tickPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
          60% { transform: scale(1.05) rotate(2deg); }
          80% { transform: scale(1.02) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default RifaDetail;
