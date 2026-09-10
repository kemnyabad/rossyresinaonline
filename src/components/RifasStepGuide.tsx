import React from 'react';
import { TicketIcon, ShieldCheckIcon, TrophyIcon } from "@heroicons/react/24/outline";

const RifasStepGuide = () => (
  <section className="bg-slate-50 py-16">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-[10px] font-black text-[#6E2CA1] uppercase tracking-[0.4em] mb-4">Guía de participación</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase leading-tight">Tu premio está a <br/><span className="text-[#6E2CA1]">3 simples pasos</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: TicketIcon, title: "1. Elige tus números", desc: "Entra al sorteo que más te guste y selecciona tus números de la suerte en la cartilla digital." },
          { icon: ShieldCheckIcon, title: "2. Paga con confianza", desc: "Realiza el pago vía Yape o transferencia y sube tu comprobante. Procesamos todo en segundos." },
          { icon: TrophyIcon, title: "3. ¡Gana premios!", desc: "Sigue nuestras transmisiones en vivo. ¡Podrías ser el próximo afortunado ganador!" }
        ].map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#6E2CA1] mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] group-hover:scale-110 group-hover:shadow-purple-200 transition-all duration-500">
              <step.icon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{step.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed px-6">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RifasStepGuide;