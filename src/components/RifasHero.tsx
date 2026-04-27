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
    <section className="relative h-[450px] md:h-[650px] overflow-hidden bg-black">
      {featuredRifas.map((rifa, idx) => (
        <div 
          key={rifa.id} 
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === mainHeroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          {/* Fondo: Imagen de producto de resina */}
          <img 
            src={rifa.image} 
            className="w-full h-full object-cover object-center opacity-80" 
            alt={rifa.title} 
          />
          
          {/* Capa de Legibilidad: Degradado oscuro a la izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex items-center px-6 md:px-20 lg:px-32">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 bg-[#6E2CA1] text-white text-[10px] md:text-[11px] font-black px-4 py-2 rounded-full mb-6 uppercase tracking-[0.25em] shadow-xl">
                <FireIcon className="w-4 h-4" /> Sorteo Destacado
              </span>
              
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-2xl leading-[0.95] mb-6">
                {rifa.title}
              </h2>
              
              <p className="text-white/90 text-sm md:text-xl mb-10 line-clamp-3 max-w-2xl font-medium leading-relaxed drop-shadow-md">
                {rifa.description}
              </p>
              
              <button 
                onClick={() => onSelect(rifa)} 
                className="!bg-white !text-[#6E2CA1] px-10 md:px-14 py-4 md:py-5 !rounded-full !font-bold text-xs md:text-base uppercase tracking-[0.2em] hover:bg-[#6E2CA1] hover:!text-white transition-all shadow-2xl active:scale-95"
              >
                PARTICIPAR AHORA
              </button>
            </div>
          </div>
        </div>
      ))}

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
      <div className="absolute bottom-10 left-6 md:left-20 lg:left-32 flex gap-3 z-20">
        {featuredRifas.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setMainHeroIndex(i)} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              mainHeroIndex === i ? 'w-12 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'
            }`} 
          />
        ))}
      </div>
    </section>
  );
};

export default RifasHero;