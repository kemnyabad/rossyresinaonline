import React from 'react';
import Link from "next/link";
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const RifasFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-white text-gray-800 border-t border-purple-100 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna 1: Marca */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#6E2CA1] via-[#cb299e] to-[#6E2CA1] flex items-center justify-center text-white font-black text-lg shadow-md">
              RR
            </div>
            <span className="font-black text-slate-900 text-xl uppercase">Rossy Resina</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Participa con total seguridad. Realizamos sorteos 100% transparentes con ganadores reales y entregas garantizadas.
          </p>
        </div>

        {/* Columna 2: Enlaces de ayuda */}
        <div>
          <h4 className="text-[#6E2CA1] font-bold text-sm uppercase tracking-wider mb-4">Ayuda</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Inicio</Link></li>
            <li><Link href="/account" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Mis Tickets</Link></li>
            <li><Link href="/terms" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Términos y Condiciones</Link></li>
            <li><Link href="/faq" className="text-gray-600 hover:text-[#6E2CA1] transition-colors">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        {/* Columna 3: Redes Sociales y Contacto */}
        <div>
          <h4 className="text-[#6E2CA1] font-bold text-sm uppercase tracking-wider mb-4">Síguenos</h4>
          <div className="flex gap-4 mb-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaTiktok className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaFacebook className="w-5 h-5" />
            </a>
            <a href="https://wa.me/51966357648" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#6E2CA1] hover:text-white transition-all">
              <FaWhatsapp className="w-5 h-5" />
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <EnvelopeIcon className="w-5 h-5 text-[#6E2CA1]" />
            <span className="text-sm">soporte@rossyresina.com</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
        Copyright © {year} - Todos los derechos reservados.
      </div>
    </footer>
  );
};
export default RifasFooter;