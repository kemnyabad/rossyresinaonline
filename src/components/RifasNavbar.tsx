import React from 'react';
import logo from "../../images/logo.jpg";

interface RifasNavbarProps {
  onBack: () => void;
  isSelected: boolean;
  router: any;
}

const RifasNavbar = ({ onBack, isSelected, router }: RifasNavbarProps) => (
  <nav className="sticky top-0 z-[60] bg-white border-b border-purple-100 px-4 py-3 shadow-sm">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={onBack}>
        <img
          src={logo.src}
          alt="Logo Rossy Resina"
          width={logo.width}
          height={logo.height}
          className="h-10 w-auto rounded-full shadow-sm object-contain transition-all duration-300 group-hover:scale-110"
        />
        <div className="flex flex-col -space-y-1">
          <span className="font-black text-slate-950 tracking-tighter text-2xl uppercase">Rossy Resina</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E2CA1] animate-pulse" />
            <span className="text-[9px] font-bold text-[#6E2CA1] tracking-[0.3em] uppercase">Sorteos Premium</span>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        <button onClick={onBack} className={`${!isSelected ? 'text-purple-600 underline decoration-2 underline-offset-[12px]' : ''} hover:text-purple-600 transition-colors`}>Sorteos</button>
        <button className="hover:text-purple-600 transition-colors">Ganadores</button>
        <button onClick={() => router.push('/contact')} className="hover:text-purple-600 transition-colors">Ayuda</button>
      </div>
      <button className="bg-slate-900 text-white px-7 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#6E2CA1] transition-all shadow-lg shadow-slate-200">Mi Cuenta</button>
    </div>
  </nav>
);

export default RifasNavbar;