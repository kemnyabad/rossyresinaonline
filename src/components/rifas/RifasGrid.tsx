import React from 'react';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline';

interface RifasGridProps {
  rifas: any[];
  onSelect: (rifa: any) => void;
}

const RifasGrid = ({ rifas, onSelect }: RifasGridProps) => (
  <section className="bg-[#fff8fc] px-4 pb-14 pt-8 md:px-6" id="sorteos">
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#7a1f61]">Sorteos disponibles</p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">
            Elige tu rifa y separa
            <span className="block text-[#7a1f61]">tus números favoritos</span>
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 md:text-base">
            Rifas verificadas, pago rápido y confirmación de participación en un flujo simple.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
          <ChartBarSquareIcon className="h-4 w-4 text-[#7a1f61]" />
          {rifas.length} sorteo{rifas.length === 1 ? '' : 's'} activo{rifas.length === 1 ? '' : 's'}
        </div>
      </div>

      {rifas.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#e9c7dd] bg-white p-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">No hay sorteos activos en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rifas.map((rifa) => {
            const sold = rifa.totalNumbers - rifa.availableNumbers;
            const isAmphora = rifa.raffleMode === 'AMPHORA';
            const progress = isAmphora ? 0 : Math.round((sold / rifa.totalNumbers) * 100);

            return (
              <article
                key={rifa.id}
                className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-[#f0d7e8] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_35px_rgba(122,31,97,0.14)]"
              >
                <div className="relative h-64 overflow-hidden bg-[#fdf2f8]">
                  {rifa.image ? (
                    <img
                      src={rifa.image}
                      alt={rifa.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-slate-500">Sin imagen</div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-black text-[#7a1f61] shadow">
                    S/ {parseFloat(rifa.pricePerNumber.toString()).toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="line-clamp-2 text-2xl font-black uppercase tracking-tight text-slate-900">{rifa.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Rossy Resina</p>

                  {isAmphora ? (
                    <div className="mt-5 rounded-2xl bg-[#fbf4f8] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#7a1f61]">Participación por ánfora</p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Compra la cantidad que quieras. Tu nombre entra una vez por cada ticket.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-[#fbf4f8] p-4">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em]">
                        <span className="text-slate-500">Avance</span>
                        <span className="text-[#7a1f61]">{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e8d4e2]">
                        <div className="h-full rounded-full bg-[#7a1f61] transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {sold}/{rifa.totalNumbers} números reservados
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => onSelect(rifa)}
                    disabled={!isAmphora && rifa.availableNumbers === 0}
                    className="mt-6 w-full rounded-full bg-[#7a1f61] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#62184e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {isAmphora ? 'Comprar tickets' : rifa.availableNumbers > 0 ? 'Seleccionar números' : 'Agotado'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  </section>
);

export default RifasGrid;
