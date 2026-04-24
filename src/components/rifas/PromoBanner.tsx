import React from 'react';

const PromoBanner = () => {
  return (
    <section className="w-full bg-white px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Contenedor principal con bordes muy redondeados y degradado vibrante */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#cb299e] via-[#6E2CA1] to-cyan-600 p-6 md:p-10 lg:p-12 shadow-2xl">
          
          {/* Decoración de fondo */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
            
            {/* 1. COLUMNA IZQUIERDA / TOP: Título Principal */}
            <div className="flex-1 text-center lg:text-left">
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase drop-shadow-[0_8px_8px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
              >
                SORTEO DÍA <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300">
                  DEL TRABAJADOR
                </span>
              </h1>
            </div>

            {/* 2. COLUMNA CENTRO: Premios y Precio */}
            <div className="flex-[2] w-full">
              {/* Ticket Cost */}
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="inline-block bg-white text-[#6E2CA1] px-6 py-3 rounded-2xl shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5 text-center">Costo del Ticket</p>
                  <p className="text-3xl md:text-4xl font-black leading-none flex items-start gap-1 justify-center" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <span className="text-lg mt-1">S/</span> 1.00
                  </p>
                </div>
              </div>

              {/* Grid de Premios */}
              <div className="w-full max-w-7xl mx-auto px-2 md:px-8">
                <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-4 space-y-4 sm:space-y-0">
                  {/* 1er Premio */}
                  <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] px-4 py-6 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-xl">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">1er Premio</p>
                    <p 
                      className="text-3xl md:text-4xl font-black text-white leading-none drop-shadow-md" 
                      style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
                    >
                      S/ 300
                    </p>
                  </div>

                  {/* 2do Premio */}
                  <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] px-4 py-6 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-xl">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">2do Premio</p>
                    <p 
                      className="text-3xl md:text-4xl font-black text-white leading-none drop-shadow-md" 
                      style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
                    >
                      S/ 100
                    </p>
                  </div>

                  {/* Extra */}
                  <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] px-4 py-6 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-xl">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">Extra</p>
                    <p 
                      className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md" 
                      style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
                    >
                      4 <span className="text-sm font-bold opacity-80 uppercase tracking-tighter">Premios x</span> S/ 50
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. COLUMNA DERECHA / BOTTOM: CTA y Transmisión */}
            <div className="flex-1 flex flex-col items-center lg:items-end gap-5">
              {/* Botón Principal CTA */}
              <button 
                onClick={() => document.getElementById('sorteos')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative overflow-hidden bg-white text-[#6E2CA1] px-10 py-5 md:py-6 rounded-full font-black text-sm md:text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-cyan-400/40 hover:-translate-y-1 active:scale-95 transition-all"
              >
                <span className="relative z-10">¡PARTICIPA Y GANA AQUÍ!</span>
              </button>

              {/* Info de Transmisión Facebook */}
              <div className="flex items-center gap-3 bg-blue-600/30 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-blue-400/30">
                <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg flex-shrink-0">
                  {/* Logo oficial de Facebook como SVG inline */}
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12.073-12-12.073s-12 5.446-12 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">
                  Sorteo en Vivo vía Facebook Live
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
