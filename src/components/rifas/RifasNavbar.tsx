import React from 'react';
import logo from '../../images/logo.jpg';
import { GiftIcon } from '@heroicons/react/24/outline';

interface RifasNavbarProps {
  onBack: () => void;
  isSelected: boolean;
  router: any;
}

const navLinkClass =
  'text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600 hover:text-[#7a1f61] transition-colors';

const RifasNavbar = ({ onBack, isSelected, router }: RifasNavbarProps) => (
  <nav className="sticky top-0 z-[60] border-b border-[#f4d9eb] bg-white/90 backdrop-blur">
    <div className="mx-auto flex h-[66px] w-full max-w-7xl items-center justify-between gap-3 px-3 md:h-[74px] md:px-6">
      <button
        onClick={onBack}
        className="group flex min-w-0 items-center gap-2 rounded-full px-1 py-1 transition-colors hover:bg-[#fbf3f8] md:gap-3 md:px-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt="Rossy Resina"
          width={logo.width}
          height={logo.height}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-[#f5deec] md:h-11 md:w-11"
        />
        <div className="min-w-0 text-left leading-tight">
          <p className="truncate text-sm font-black uppercase tracking-tight text-slate-900 md:text-base">Rossy Resina</p>
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-[#7a1f61] md:text-[10px] md:tracking-[0.28em]">Rifas Oficiales</p>
        </div>
      </button>

      <div className="hidden items-center gap-8 md:flex">
        <button onClick={onBack} className={`${navLinkClass} ${!isSelected ? 'text-[#7a1f61]' : ''}`}>
          Sorteos
        </button>
        <button onClick={() => router.push('/rifas#pasos')} className={navLinkClass}>
          Como participar
        </button>
        <button onClick={() => router.push('/contact')} className={navLinkClass}>
          Soporte
        </button>
      </div>

      <button
        onClick={() => router.push('/account')}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#7a1f61] px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#62184e] md:px-5 md:text-[11px] md:tracking-[0.16em]"
      >
        <GiftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Mis tickets</span>
        <span className="sm:hidden">Tickets</span>
      </button>
    </div>
  </nav>
);

export default RifasNavbar;
