import React from 'react';
import { TicketIcon, ShieldCheckIcon, TrophyIcon } from '@heroicons/react/24/outline';

const RifasStepGuide = () => (
  <section id="pasos" className="bg-white px-4 py-16 md:px-6 md:py-20">
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-12 text-center">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#7a1f61]">Proceso simple y seguro</p>
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">
          Participa en 3 pasos
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            icon: TicketIcon,
            title: 'Elige números',
            desc: 'Ingresa al sorteo, revisa la cartilla y selecciona los números disponibles que prefieras.',
          },
          {
            icon: ShieldCheckIcon,
            title: 'Envía tu pago',
            desc: 'Paga por Yape o transferencia y sube tu comprobante en el checkout de forma rápida.',
          },
          {
            icon: TrophyIcon,
            title: 'Sigue el resultado',
            desc: 'Verificamos tu compra y participas en la transmisión en vivo del sorteo oficial.',
          },
        ].map((step, i) => (
          <article
            key={i}
            className="rounded-[1.6rem] border border-[#f0d7e8] bg-[#fff9fd] p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#7a1f61] shadow-sm">
              <step.icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">{i + 1}. {step.title}</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{step.desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default RifasStepGuide;
