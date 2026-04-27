import React from 'react';
import { FireIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface RifasHeroProps {
  featuredRifas: any[];
  mainHeroIndex: number;
  setMainHeroIndex: (index: number) => void;
  onSelect: (rifa: any) => void;
}

const RifasHero = ({ featuredRifas, mainHeroIndex, setMainHeroIndex, onSelect }: RifasHeroProps) => {
  if (featuredRifas.length === 0) return null;

  const nextSlide = () => setMainHeroIndex((mainHeroIndex + 1) % featuredRifas.length);
  const prevSlide = () => setMainHeroIndex((mainHeroIndex - 1 + featuredRifas.length) % featuredRifas.length);

  return (
    <section className="relative h-[300px] md:h-[400px] overflow-hidden bg-slate-900">
    <section className="relative h-[450px] md:h-[600px] overflow-hidden bg-black">
      {featuredRifas.map((rifa, idx) => (
        <div key={rifa.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === mainHeroIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src={rifa.image} className="w-full h-full object-cover object-center opacity-70" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/20 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 md:px-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6E2CA1] to-[#cb299e] text-white text-[9px] font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-[0.25em] shadow-lg shadow-purple-500/30">
                <FireIcon className="w-3 h-3" /> Sorteo en tendencia
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter mb-4">{rifa.title}</h2>
              <p className="text-slate-200 text-xs md:text-sm mb-8 line-clamp-2 max-w-md font-medium leading-relaxed">{rifa.description}</p>
              <button onClick={() => onSelect(rifa)} className="bg-white text-[#6E2CA1] px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#6E2CA1] hover:text-white transition-all shadow-xl hover:shadow-purple-500/20 active:scale-95">Participar Ahora</button>
        <div 
          key={rifa.id} 
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === mainHeroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
          }`}
        >
          {/* Imagen de Fondo con Zoom Suave */}
          <img 
            src={rifa.image} 
            className="w-full h-full object-cover object-center" 
            alt={rifa.title} 
          />
          
          {/* Capa de Legibilidad: Degradado Profundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          
          {/* Contenido de Texto con Animación */}
          <div className="absolute inset-0 flex items-center px-6 md:px-20 lg:px-32">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-[#6E2CA1] text-white text-[10px] md:text-[11px] font-black px-4 py-2 rounded-full mb-6 uppercase tracking-[0.2em] shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700">
                <FireIcon className="w-4 h-4" /> Sorteo Destacado
              </div>
              
              <h2 className="text-2xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-2xl leading-[0.95] mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
                {rifa.title}
              </h2>
              
              <p className="text-white/80 text-sm md:text-xl mb-10 line-clamp-3 max-w-2xl font-medium leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
                {rifa.description}
              </p>
              
              <button 
                onClick={() => onSelect(rifa)} 
                className="bg-white text-[#6E2CA1] px-10 md:px-14 py-4 md:py-5 rounded-full font-bold text-xs md:text-base uppercase tracking-[0.2em] hover:bg-[#6E2CA1] hover:text-white transition-all shadow-2xl hover:shadow-purple-500/50 active:scale-95 animate-in fade-in zoom-in duration-1000 delay-300"
              >
                PARTICIPAR AHORA
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-6 right-6 md:right-12 flex gap-2">

      {/* Flechas de navegación (Solo Desktop) */}
      <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 w-full justify-between px-10 pointer-events-none">
        <button onClick={prevSlide} className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#6E2CA1] transition-all">
          <ChevronLeftIcon className="w-6 h-6 stroke-[3]" />
        </button>
        <button onClick={nextSlide} className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#6E2CA1] transition-all">
          <ChevronRightIcon className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Indicadores de Paginación */}
      <div className="absolute bottom-10 left-6 md:left-20 lg:left-32 flex gap-3 z-30">
        {featuredRifas.map((_, i) => (
          <button key={i} onClick={() => setMainHeroIndex(i)} className={`h-2 rounded-full transition-all duration-500 ${mainHeroIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
          <button 
            key={i} 
            onClick={() => setMainHeroIndex(i)} 
            className={`h-1.5 rounded-full transition-all duration-700 ${
              mainHeroIndex === i ? 'w-16 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'w-4 bg-white/20 hover:bg-white/40'
            }`} 
          />
        ))}
      </div>
    </section>
  );
};

export default RifasHero;