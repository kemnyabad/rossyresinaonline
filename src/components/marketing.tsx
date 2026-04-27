import React, { useState } from 'react';
import Head from 'next/head';
import { 
  CloudArrowUpIcon, 
  ClipboardDocumentIcon, 
  FolderIcon,
  CircleStackIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

// Datos de ejemplo para la galería de Flyers/Recursos
const PRODUCT_RESOURCES = [
  { id: 1, name: 'Resina Epóxica Cristal 1kg', price: '140.00', driveUrl: '#' },
  { id: 2, name: 'Molde Letras XXL', price: '65.00', driveUrl: '#' },
  { id: 3, name: 'Pigmento Metálico Oro', price: '18.00', driveUrl: '#' },
  { id: 4, name: 'Lámpara UV Pro', price: '85.00', driveUrl: '#' },
  { id: 5, name: 'Kit Joyería Principiantes', price: '110.00', driveUrl: '#' },
  { id: 6, name: 'Resina UV 200g', price: '45.00', driveUrl: '#' },
  { id: 7, name: 'Pigmentos Neón Set', price: '35.00', driveUrl: '#' },
  { id: 8, name: 'Espátulas de Silicona', price: '12.00', driveUrl: '#' },
];

// Estado de inventario para productos estrella
const INVENTORY_DATA = [
  { name: 'Resina Epóxica 2:1', status: 'Disponible', available: true },
  { name: 'Moldes Letras Grande', status: 'Agotado', available: false },
  { name: 'Pigmento Neón Amarillo', status: 'Disponible', available: true },
  { name: 'Lámpara UV 36W', status: 'Disponible', available: true },
];

export default function MarketingAdminPage() {
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  const handleCopyData = (name: string, price: string, id: number) => {
    const text = `${name} - S/ ${price}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#6E2CA1]/40">
      <Head>
        <title>Marketing Admin | Rossy Resina</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-2">
              Panel de Marketing <span className="text-[#6E2CA1]">Rossy Resina</span>
            </h1>
            <p className="text-gray-400 font-medium tracking-wide">
              Gestión de Recursos Digitales, Flyers e Inventario de Marca
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#6E2CA1]/10 border border-[#6E2CA1]/20 p-4 rounded-2xl">
            <CloudArrowUpIcon className="h-8 w-8 text-[#6E2CA1]" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-[#6E2CA1] tracking-widest leading-none mb-1">Backup Cloud</p>
              <p className="text-sm font-bold">Drive Sincronizado</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          
          {/* Grid de Flyers / Productos */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-[#6E2CA1] rounded-full" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Galería de Flyers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {PRODUCT_RESOURCES.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-[#6E2CA1]/50 transition-all duration-300 shadow-2xl group"
                >
                  {/* Placeholder Imagen */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-black relative flex items-center justify-center border-b border-white/5">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <span className="text-gray-600 font-black text-4xl uppercase select-none tracking-tighter">
                      {product.name.split(' ')[0]}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-white truncate mb-1">
                      {product.name}
                    </h3>
                    <p className="text-[#6E2CA1] font-black text-xl mb-5">
                      S/ {product.price}
                    </p>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleCopyData(product.name, product.price, product.id)}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
                          copyFeedback === product.id 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        {copyFeedback === product.id ? '¡Copiado!' : 'Copiar Datos'}
                      </button>
                      
                      <a 
                        href={product.driveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 rounded-xl bg-[#6E2CA1]/10 text-[#6E2CA1] text-[10px] font-black uppercase tracking-[0.15em] border border-[#6E2CA1]/20 hover:bg-[#6E2CA1] hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <FolderIcon className="h-4 w-4" />
                        Fotos Drive
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar: Inventario Rápido */}
          <aside className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <CircleStackIcon className="h-6 w-6 text-[#6E2CA1]" />
                <h2 className="text-lg font-black uppercase tracking-tight">Stock Express</h2>
              </div>

              <div className="space-y-4">
                {INVENTORY_DATA.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.available ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">OK</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 text-rose-500" />
                          <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">OUT</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#6E2CA1] hover:text-white transition-all shadow-xl active:scale-95">
                Gestionar Almacén
              </button>

              <div className="mt-8 p-4 rounded-2xl border border-dashed border-white/10">
                <p className="text-[10px] font-black text-[#6E2CA1] uppercase tracking-widest mb-2">Recordatorio</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                  "La coherencia de precios entre el catálogo y los flyers es vital para la confianza del cliente."
                </p>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.5em]">Rossy Resina • Marketing Dashboard v1.0</p>
      </footer>
    </div>
  );
}