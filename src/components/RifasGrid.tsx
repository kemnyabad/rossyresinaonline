import React from 'react';

interface RifasGridProps {
  rifas: any[];
  onSelect: (rifa: any) => void;
}

const RifasGrid = ({ rifas, onSelect }: RifasGridProps) => (
  <div className="max-w-7xl mx-auto px-4 pt-10 pb-16 bg-white" id="sorteos">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div className="max-w-xl">
        <p className="text-[11px] font-black text-[#6E2CA1] uppercase tracking-[0.4em] mb-4">Oportunidades únicas</p>
        <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">
          Sorteos <br/><span className="text-[#6E2CA1]">Destacados</span>
        </h2>
        <p className="text-slate-400 text-base mt-4 font-medium max-w-sm">Participa y gana premios exclusivos con Rossy Resina.</p>
      </div>
    </div>

    {rifas.length === 0 ? (
      <div className="bg-slate-50 rounded-[3rem] p-24 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest">No hay sorteos activos en este momento.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rifas.map((rifa) => {
          const sold = rifa.totalNumbers - rifa.availableNumbers;
          const progress = Math.round((sold / rifa.totalNumbers) * 100);

          return (
            <div
              key={rifa.id}
              className="group bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(110,44,161,0.1)] transition-all duration-500 flex flex-col h-full hover:-translate-y-2 border border-slate-50"
            >
              <div className="relative h-80 overflow-hidden p-4">
                {rifa.image && (
                  <img src={rifa.image} alt={rifa.title} className="w-full h-full object-cover rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-105" />
                )}
                <div className="absolute top-8 left-8">
                  <span className="bg-[#6E2CA1] text-white px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg">
                    S/ {parseFloat(rifa.pricePerNumber.toString()).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2 flex flex-col flex-1">
                <h3 className="text-2xl font-black text-slate-950 leading-tight mb-2 tracking-tighter uppercase"> {rifa.title} </h3>
                <p className="text-slate-400 text-sm font-medium mb-4">Rossy Resina Premium</p>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso de venta</span>
                    <span className="text-[10px] font-black text-[#6E2CA1] bg-purple-50 px-2 py-1 rounded-md">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6E2CA1] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => onSelect(rifa)}
                  disabled={rifa.availableNumbers === 0}
                  className="w-full py-5 px-6 bg-[#6E2CA1] text-white rounded-full font-black text-[12px] uppercase tracking-[0.2em] hover:bg-slate-950 transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 shadow-lg shadow-purple-200 hover:shadow-purple-500/20"
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
);

export default RifasGrid;