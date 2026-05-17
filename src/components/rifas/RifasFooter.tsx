import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const RifasFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#f0d7e8] bg-[#fff8fc] px-4 pb-8 pt-12 md:px-6">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7a1f61] text-sm font-black text-white">RR</div>
            <p className="text-lg font-black uppercase tracking-tight text-slate-900">Rossy Resina</p>
          </div>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-600">
            Sorteos transparentes, participación validada y comunicación directa para cada ganador.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#7a1f61]">Ayuda</h4>
          <ul className="space-y-2 text-sm font-semibold text-slate-600">
            <li><Link href="/rifas" className="hover:text-[#7a1f61]">Rifas activas</Link></li>
            <li><Link href="/account" className="hover:text-[#7a1f61]">Mis tickets</Link></li>
            <li><Link href="/terms" className="hover:text-[#7a1f61]">Términos</Link></li>
            <li><Link href="/faq" className="hover:text-[#7a1f61]">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#7a1f61]">Contacto</h4>
          <div className="mb-4 flex gap-3">
            {[
              { href: 'https://instagram.com', icon: FaInstagram, label: 'Instagram' },
              { href: 'https://tiktok.com', icon: FaTiktok, label: 'Tiktok' },
              { href: 'https://facebook.com', icon: FaFacebook, label: 'Facebook' },
              { href: 'https://wa.me/51966357648', icon: FaWhatsapp, label: 'Whatsapp' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-[#7a1f61] hover:text-white"
              >
                <item.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            <EnvelopeIcon className="h-4 w-4 text-[#7a1f61]" />
            soporte@rossyresina.com
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 w-full max-w-7xl border-t border-[#f0d7e8] pt-5 text-center text-xs font-medium text-slate-500">
        © {year} Rossy Resina. Todos los derechos reservados.
      </p>
    </footer>
  );
};

export default RifasFooter;
