'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ShoppingCartIcon, TrophyIcon, InformationCircleIcon, TicketIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

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

interface BannerSlide { // Re-defining here for RifaDetail's internal use, assuming it's not globally imported
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
  // Ad state
  const [adActive, setAdActive] = useState(true);
  const [timer, setTimer] = useState(10);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const soldCount = selectedRifa.totalNumbers - selectedRifa.availableNumbers;
  const progress = Math.round((soldCount / selectedRifa.totalNumbers) * 100);
  const totalAmount = selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString());
  const prizeLines = selectedRifa.prizes
    ? selectedRifa.prizes.split('\n').map((line: string) => line.replace(/[✨🏆⭐•-]/g, '').trim()).filter(Boolean)
    : [];

  // Bloqueo radical del scroll vinculado al estado del anuncio
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

  // Ad timer effect
  useEffect(() => {
    // Skip ad if no video URL
    if (!selectedRifa.videoUrl) {
      setAdActive(false);
      return;
    }

    if (adActive && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (adActive && timer === 0) {
      setShowSkipButton(true);
    }
  }, [adActive, timer, selectedRifa.videoUrl]);

  // Play video with audio effect
  useEffect(() => {
    if (adActive && selectedRifa.videoUrl && videoRef.current) {
      videoRef.current.play().catch(error => {
        // En caso de que el navegador aún bloquee el audio por falta de interacción previa directa
        console.error("Error al intentar reproducir video con audio:", error);
      });
    }
  }, [adActive, selectedRifa.videoUrl]);

  const handleSkipAd = () => {
    if (videoRef.current) {
      videoRef.current.pause(); // Limpieza de audio inmediata
    }
    setAdActive(false);
  };

  // If ad is active, render the ad overlay
  if (adActive && selectedRifa.videoUrl) {
    return (
      <div 
        className="fixed inset-0 h-[100dvh] w-screen z-[9999] bg-black m-0 p-0 border-none flex items-center justify-center overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        <video
          ref={videoRef}
          src={selectedRifa.videoUrl}
          autoPlay
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          onEnded={handleSkipAd} // Automatically skip if video ends
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

  // Main Rifa Detail content after ad is skipped
  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 overflow-y-auto h-[100dvh] w-full antialiased">
      <div className="animate-in fade-in duration-500 py-8 px-4 md:px-6 max-w-7xl mx-auto mb-12">
      <button
        onClick={onBack}
        className="mt-4 mb-8 inline-flex items-center gap-3 text-slate-400 hover:text-slate-950 font-bold text-xs md:text-sm uppercase tracking-widest transition-all group"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        Volver al listado
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-7">
          {/* Left Column (Info) */}
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900 leading-[1.1] mb-4">
            {selectedRifa.title}
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-slate-600 mb-6">{selectedRifa.description}</p>

          {/* Main Image / Slider */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 aspect-[16/10] shadow-2xl mb-8">
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
          {/* How to Participate Section */}
          <div className="rounded-[2rem] border border-slate-100 p-8 bg-white shadow-sm mb-8">
            <h3 className="text-xl font-black text-[#6E2CA1] uppercase tracking-tight mb-6">Cómo Participar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: TicketIcon, title: "Elige tus números", desc: "Selecciona tus números de la suerte en la cartilla virtual." },
                { icon: ShieldCheckIcon, title: "Paga con confianza", desc: "Realiza el pago y sube tu comprobante. Todo en segundos." },
                { icon: TrophyIcon, title: "¡Gana premios!", desc: "Sigue la transmisión en vivo. ¡Podrías ser el afortunado!" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-[#6E2CA1] mb-4 border border-purple-100/50">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">{step.title}</p>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedRifa.rules && (
            <div className="rounded-[2rem] border border-slate-100 p-8 bg-white shadow-sm mb-8">
              <div className="flex items-center gap-2 mb-4">
                <InformationCircleIcon className="w-5 h-5 text-slate-300" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400">Reglas del Sorteo</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar font-medium">{selectedRifa.rules}</p>
            </div>
          )}

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

        {/* Right Column (Action) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="inline-flex self-start px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Activo Ahora
          </div>
          <h2 className="text-lg md:text-2xl font-extrabold text-[#6E2CA1] uppercase text-center md:text-left">¡ESCOGE TUS NÚMEROS!</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[2rem] border border-slate-100 p-6 bg-white shadow-sm">
              <p className="text-[9px] uppercase text-slate-400 font-black mb-2 tracking-widest">Precio Ticket</p>
              <p className="text-2xl font-black text-slate-900">S/ {parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)}</p>
            </div>
            <div className="rounded-[2rem] border border-slate-100 p-6 bg-white shadow-sm">
              <p className="text-[9px] uppercase text-slate-400 font-black mb-2 tracking-widest">Libres</p>
              <p className="text-2xl font-black text-[#6E2CA1]">{selectedRifa.availableNumbers}</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-purple-50 border border-purple-100 p-8">
            <div className="flex items-center justify-between text-[10px] font-black text-[#6E2CA1] mb-5 uppercase tracking-[0.25em]">
              <span>Estado de Venta</span>
              <span className="bg-white px-3 py-1 rounded-full shadow-sm">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-[#6E2CA1] to-[#cb299e] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(110,44,161,0.3)]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Number Grid */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">Cartilla <span className="text-[#6E2CA1]">Virtual</span></h3>
              <div className="bg-slate-50 px-6 py-3 rounded-full border border-slate-100">
                <span className="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em]">{selectedNumbers.length} seleccionados</span>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"> {/* Reduced max-height for compactness */}
              {!loading ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
                  {Array.from({ length: selectedRifa.totalNumbers }, (_, i) => i + 1).map((num) => {
                    const ticket = numbers?.tickets.find((t: any) => t.number === num);
                    const isSelected = selectedNumbers.includes(num);
                    const isAvailable = ticket?.status === 'AVAILABLE';

                    return (
                      <button
                        key={num}
                        onClick={() => {
                          if (isAvailable) toggleNumber(num);
                        }}
                        disabled={!isAvailable}
                        className={`aspect-square rounded-full font-bold text-[11px] sm:text-sm transition-all duration-300 transform active:scale-90 border-2 ${
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
          
          {/* Mi Compra Summary */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 lg:sticky lg:top-24 shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl rounded-full -mr-16 -mt-16 opacity-50"></div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#6E2CA1] font-black mb-6 flex items-center gap-2 relative z-10"><ShoppingCartIcon className="w-4 h-4"/> Mi Compra</p>
            
            <div className="space-y-6 mb-8 relative z-10">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Tickets</span>
                <span className="text-slate-900">{selectedNumbers.length} und.</span>
              </div>
              <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                <span className="text-[10px] font-black text-[#6E2CA1] uppercase tracking-widest mb-1">Total Final</span>
                <span className="text-4xl font-black text-slate-950 leading-none">S/ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest mb-8 text-slate-400 relative z-10">
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
                className="w-full py-4 md:py-5 px-6 bg-[#6E2CA1] text-white rounded-full font-black text-sm md:text-base tracking-wider hover:bg-slate-950 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-3 disabled:bg-slate-50 disabled:text-slate-300"
              >
                Reservar tickets <ShoppingCartIcon className="w-5 h-5"/>
              </button>
            </div>

            {selectedRifa.rules && (
              <div className="mt-8 pt-6 border-t border-slate-50 relative z-10">
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
    </div>
  );
};

export default RifaDetail;