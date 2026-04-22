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
  return (
    <section className="relative h-[300px] md:h-[400px] overflow-hidden bg-slate-900">
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
  );
};

export default RifasHero;