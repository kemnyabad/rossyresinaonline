import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { 
  CloudArrowUpIcon, 
  ClipboardDocumentIcon, 
  FolderIcon,
  CircleStackIcon,
  CheckCircleIcon,
  RectangleGroupIcon,
  PhotoIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline";

// Datos reales basados en productos del proyecto
const PRODUCT_RESOURCES = [
  { 
    id: 1, 
    name: 'Resina Epóxica Cristal', 
    price: '140.00', 
    image: '/products/resina-epoxica.png',
    driveUrl: 'https://drive.google.com/folders/RECURSO_RESINA?usp=sharing' 
  },
  { 
    id: 2, 
    name: 'Lapicero Shaker Corazón', 
    price: '35.00', 
    image: '/products/lapicero-shaker-corazon.avif',
    driveUrl: 'https://drive.google.com/folders/LAPICERO_CORAZON?usp=sharing' 
  },
  { 
    id: 3, 
    name: 'Pigmento Perlado Dorado', 
    price: '22.00', 
    image: '/products/pigmento_perlado_metalico_dorado_030.avif',
    driveUrl: 'https://drive.google.com/folders/PIGMENTO_DORADO?usp=sharing' 
  },
  { 
    id: 4, 
    name: 'Lápiz Shaker Estrella', 
    price: '32.00', 
    image: '/products/lapicero-shaker-estrella.avif',
    driveUrl: 'https://drive.google.com/folders/LAPICERO_ESTRELLA?usp=sharing' 
  },
  { 
    id: 5, 
    name: 'Molde Botones', 
    price: '18.00', 
    image: '/products/molde_botones.avif',
    driveUrl: 'https://drive.google.com/folders/MOLDE_BOTONES?usp=sharing' 
  },
  { 
    id: 6, 
    name: 'Oso Cariñoso', 
    price: '45.00', 
    image: '/products/oso-carinoso.avif',
    driveUrl: 'https://drive.google.com/folders/OSO_CARI?usp=sharing' 
  },
  { 
    id: 7, 
    name: 'Virgen de Guadalupe', 
    price: '28.00', 
    image: '/products/Virgen-de-guadalupe.avif',
    driveUrl: 'https://drive.google.com/folders/VIRGEN_GUADALUPE?usp=sharing' 
  },
  { 
    id: 8, 
    name: 'Zapato Quinceañera', 
    price: '55.00', 
    image: '/products/zapato-quinceanera.avif',
    driveUrl: 'https://drive.google.com/folders/ZAPATO_QUINCEA?usp=sharing' 
  },
];

// Estado de inventario para productos estrella
const INVENTORY_DATA = [
  { name: 'Resina Epóxica 2:1', status: 'Disponible', available: true },
  { name: 'Lapicero Shaker Corazón', status: 'Disponible', available: true },
  { name: 'Pigmento Neón Amarillo', status: 'Agotado', available: false },
  { name: 'Molde Letras Grande', status: 'Disponible', available: true },
];

const STATS = [
  { label: 'Total Productos', value: '48', icon: RectangleGroupIcon },
  { label: 'Recursos en Drive', value: '120+', icon: PhotoIcon },
  { label: 'Campañas Activas', value: '4', icon: RocketLaunchIcon },
];

export default function MarketingPage() {
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  const handleCopyData = (name: string, price: string, id: number) => {
    const text = `${name} - S/ ${price}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  return (
    <>
      <Head>
        <title>Panel de Marketing | Rossy Resina</title>
        <meta name="description" content="Panel administrativo de marketing para gestión de productos y recursos digitales" />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#6E2CA1]/50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Header */}
          <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                Panel de Marketing Rossy Resina
              </h1>
              <p className="text-sm md:text-base text-[#6E2CA1] font-black uppercase tracking-[0.4em] opacity-80">
                High-Tech Digital Asset Management
              </p>
            </div>
          </header>

          {/* Quick Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" aria-label="Estadísticas rápidas">
            {STATS.map((stat, i) => (
              <div 
                key={i} 
                className="bg-white/[0.03] backdrop-blur-md border border-gray-800/50 p-6 rounded-3xl flex items-center justify-between hover:border-[#6E2CA1]/30 transition-colors group"
              >
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                </div>
                <stat.icon className="h-10 w-10 text-[#6E2CA1] opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-10">
            
            {/* Grid de Productos */}
            <section aria-label="Galería de productos para marketing">
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Flyer Assets</h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {PRODUCT_RESOURCES.map((product) => (
                  <article 
                    key={product.id} 
                    className="group bg-white/[0.02] backdrop-blur-xl border border-gray-800/50 rounded-[2.5rem] overflow-hidden hover:border-[#6E2CA1]/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(110,44,161,0.2)] transition-all duration-500"
                  >
                    {/* Imagen del producto */}
                    <div className="relative h-56 bg-black flex items-center justify-center p-4 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={250}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                        priority={product.id < 3}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />
                    </div>

                    {/* Contenido */}
                    <div className="p-7">
                      <h3 className="font-bold text-base text-gray-200 mb-2 line-clamp-1 group-hover:text-white transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="text-3xl font-black text-[#6E2CA1] mb-8 tracking-tighter drop-shadow-[0_0_10px_rgba(110,44,161,0.3)]">
                        S/ {product.price}
                      </div>

                      <div className="space-y-3">
                        <button 
                          onClick={() => handleCopyData(product.name, product.price, product.id)}
                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all duration-300 ${
                            copyFeedback === product.id
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-[#6E2CA1] text-white hover:shadow-lg hover:shadow-[#6E2CA1]/40'
                          }`}
                        >
                          {copyFeedback === product.id ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5" />
                          )}
                          <span>{copyFeedback === product.id ? '¡Copiado!' : 'Copiar para Flyer'}</span>
                        </button>
                        
                        <a 
                          href={product.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 rounded-2xl border border-gray-800 text-gray-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:border-[#6E2CA1] hover:text-white transition-all duration-300"
                        >
                          <FolderIcon className="h-4 w-4" />
                          Recurso Drive
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Sidebar Stock */}
            <aside className="space-y-6 xl:sticky xl:top-10 xl:self-start">
              <section className="bg-white/[0.02] backdrop-blur-2xl border border-gray-800/50 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-[#6E2CA1]/20 rounded-lg">
                    <CircleStackIcon className="h-5 w-5 text-[#6E2CA1]" />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest">Inventory</h2>
                </div>

                <div className="space-y-3 mb-8">
                  {INVENTORY_DATA.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-transparent hover:border-gray-800 transition-all group"
                    >
                      <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      {item.available ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">OK</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md">Out</span>
                      )}
                    </div>
                  ))}
                </div>

                <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#6E2CA1] hover:text-white transition-all duration-500">
                  System Inventory →
                </button>

                <div className="mt-10 p-5 rounded-3xl bg-[#6E2CA1]/5 border border-[#6E2CA1]/10">
                  <p className="text-[10px] font-black uppercase text-[#6E2CA1] tracking-widest mb-3">UI Logic</p>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    &quot;Design is intelligence made visible.&quot;
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>

        <footer className="mt-24 py-12 border-t border-gray-900 text-center">
          <p className="text-[10px] font-black uppercase text-gray-700 tracking-[1em]">Rossy Resina • High Tech Admin v4.0</p>
        </footer>
      </div>
    </>
  );
}
