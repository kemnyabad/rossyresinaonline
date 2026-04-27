import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PrizeItem {
  label: string;
  amount: string;
}

interface PaymentInfo {
  method: string;
  phone: string;
  owner: string;
}

interface BannerData {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  ticketPrice: string;
  ticketCaption?: string;
  supportLine?: string;
  paymentInfo?: PaymentInfo;
  prizes: PrizeItem[];
}

const banners: BannerData[] = [
  {
    id: 'dia-del-trabajador',
    eyebrow: 'Sorteo especial de temporada',
    title: 'Separa tu ticket',
    subtitle: 'Sorteo Dia del Trabajador',
    gradient: 'from-[#54113f] via-[#9a2f72] to-[#e25d8d]',
    accent: '#12aeb7',
    ticketPrice: '1.00',
    ticketCaption: 'Ticket a solo',
    paymentInfo: {
      method: 'Yape',
      phone: '961 770 723',
      owner: 'Rosa Maribel Abad Landacay',
    },
    prizes: [
      { label: '1er premio', amount: 'S/ 300' },
      { label: '2do premio', amount: 'S/ 100' },
      { label: 'Premios extra', amount: '4 premios de S/ 50' },
    ],
  },
  {
    id: 'dia-de-la-madre',
    eyebrow: 'Campaña premium',
    title: 'Sorteo "Día de la Madre"',
    subtitle: '',
    gradient: 'from-[#581646] via-[#9b315f] to-[#dc5f87]',
    accent: '#f7c948',
    ticketPrice: '3.00',
    ticketCaption: 'Ticket desde',
    prizes: [
      { label: '1er premio', amount: 'S/ 500' },
      { label: '2do premio', amount: 'S/ 200' },
      { label: 'Premios extra', amount: '2 x S/ 100' },
    ],
  },
];

const ROTATION_MS = 10000;
const YAPE_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/7/76/Yape_peru_logotype.svg';
const BANNER_CHARACTER_URLS: Record<string, string> = {
  'dia-del-trabajador': '/rifas/rossy-resina-banner-personaje.png',
  'dia-de-la-madre': '/rifas/rossy-resina-banner-madre-2026.png',
};

const RifaSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = banners.length;

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, ROTATION_MS);
  }, [total]);

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restartTimer]);

  const handleManualNav = (newIndex: number) => {
    setActiveIndex(newIndex);
    restartTimer();
  };

  return (
    <section className="bg-[#fff8fc] pb-3 pt-0" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="relative h-[275px] w-screen overflow-hidden border-y border-[#f2d5e8] bg-white xs:h-[295px] sm:h-[330px] md:h-[560px]">
        {banners.map((banner, idx) => {
          const isActive = idx === activeIndex;
          const isWorkerRaffle = banner.id === 'dia-del-trabajador';
          const isMotherRaffle = banner.id === 'dia-de-la-madre';
          const headlineSubtitle = isWorkerRaffle ? 'Sorteo Día del Trabajador' : banner.subtitle;
          const bannerCharacterUrl = BANNER_CHARACTER_URLS[banner.id];

          return (
            <article
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ${
                isActive ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'
              }`}
            >
              <div className={`relative h-full w-full bg-gradient-to-r ${banner.gradient}`}>
                <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,rgba(255,255,255,.22)_0,rgba(255,255,255,0)_38%),radial-gradient(circle_at_20%_18%,rgba(255,255,255,.18),transparent_30%),linear-gradient(25deg,rgba(255,255,255,.1)_0,rgba(255,255,255,0)_50%)]" />

                <div className="relative z-10 flex h-full flex-col px-3 py-3 text-white xs:px-4 md:hidden">
                  <div className="grid min-h-0 flex-1 grid-cols-[46%_minmax(0,1fr)] items-stretch rounded-[22px] border border-white/10 bg-white/[0.04]">
                    <div className="relative overflow-visible">
                      <div className="absolute inset-y-5 right-0 w-px bg-white/18" />
                      <div className="absolute inset-x-0 -bottom-14 mx-auto h-[260px] xs:-bottom-16 xs:h-[292px] sm:-bottom-20 sm:h-[350px]">
                        <div className="absolute bottom-8 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-white/12 blur-3xl" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bannerCharacterUrl}
                          alt="Representante Rossy Resina"
                          className="absolute bottom-0 left-1/2 h-full max-w-none -translate-x-1/2 object-contain"
                        />
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col items-center justify-center px-3 py-3 text-center xs:px-4 sm:px-5">
                      <p className="text-[7px] font-black uppercase tracking-[0.16em] text-white/82 xs:text-[8px] sm:text-[9px]">
                        {banner.eyebrow}
                      </p>
                      <h1 className="rifa-highlight-title mt-1 max-w-[190px] text-[1.35rem] font-black leading-[0.9] xs:max-w-[220px] xs:text-[1.62rem] sm:max-w-[300px] sm:text-[2.05rem]">
                        {isWorkerRaffle ? headlineSubtitle : banner.title}
                      </h1>
                      <p className="mt-1.5 text-[0.82rem] font-black uppercase leading-none tracking-[0.04em] xs:text-sm sm:text-base">
                        {isWorkerRaffle ? banner.title : banner.subtitle || 'Separa tu ticket'}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[#6d1b57] shadow-[0_12px_26px_rgba(0,0,0,.2)] xs:px-4 xs:py-2">
                        <span className="text-[7px] font-black uppercase tracking-[0.12em] text-[#6d1b57]/70 xs:text-[8px]">
                          Ticket
                        </span>
                        <span className="text-sm font-black leading-none xs:text-base sm:text-lg">S/ {banner.ticketPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => document.getElementById('sorteos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="relative z-10 mt-3 rounded-full bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-[#6d1b57] shadow-[0_14px_30px_rgba(0,0,0,.22)] ring-1 ring-white/70 transition active:scale-95 xs:text-[11px] sm:py-3.5 sm:text-xs"
                  >
                    Ver sorteos activos
                  </button>
                </div>

                <div className="mx-auto hidden h-full max-w-[1400px] grid-cols-1 gap-3 px-5 py-5 sm:gap-4 md:grid md:grid-cols-12 md:items-center md:gap-10 md:px-12 md:py-10">
                  <div className="relative min-h-[330px] sm:min-h-[370px] md:col-span-5 md:h-[500px]">
                    <div className="pointer-events-none absolute inset-x-0 bottom-[-18px] mx-auto h-[410px] max-w-[520px] sm:h-[455px] md:bottom-[-34px] md:left-0 md:mx-0 md:h-[590px] md:max-w-none">
                      <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-white/14 blur-3xl md:top-14 md:h-96 md:w-96" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bannerCharacterUrl}
                        alt="Representante Rossy Resina"
                        className="absolute bottom-0 left-1/2 h-full max-w-none -translate-x-1/2 object-contain drop-shadow-[0_28px_42px_rgba(18,4,22,.42)] md:left-[44%]"
                      />
                    </div>

                  </div>

                  <div className="text-white md:col-span-7">
                    <p className="text-center text-sm font-bold uppercase tracking-[0.22em] text-white/82 md:text-left md:text-base">
                      {banner.eyebrow}
                    </p>

                    {isWorkerRaffle ? (
                      <>
                        <h1 className="rifa-highlight-title mx-auto mt-2 max-w-5xl text-center text-[3.35rem] font-black leading-[0.9] sm:text-6xl md:mx-0 md:max-w-none md:text-left">
                          {headlineSubtitle}
                        </h1>

                        <p className="mx-auto mt-2 max-w-4xl text-center text-2xl font-bold uppercase leading-[0.92] sm:text-3xl md:mx-0 md:text-center md:text-5xl">
                          {banner.title}
                        </p>
                      </>
                    ) : (
                      <>
                        <h1 className="rifa-highlight-title mx-auto mt-2 max-w-5xl text-center text-[3.35rem] font-bold leading-[0.95] sm:text-6xl md:mx-0 md:max-w-none md:text-left">
                          {banner.title}
                        </h1>

                        {banner.subtitle && (
                          <p className="mt-4 max-w-4xl text-center text-2xl font-bold uppercase leading-tight md:text-left md:text-5xl">
                            {banner.subtitle}
                          </p>
                        )}
                      </>
                    )}

                    {banner.supportLine && (
                      <p className="mt-5 max-w-2xl text-center text-lg font-semibold leading-snug text-white/88 md:text-left md:text-xl">
                        {banner.supportLine}
                      </p>
                    )}

                    {!isMotherRaffle && (
                      <div className="mt-5 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 md:mt-7">
                        {banner.prizes.map((prize, prizeIndex) => (
                          <div
                            key={prize.label}
                            className="group relative overflow-hidden rounded-[22px] border border-white/20 bg-white/10 p-4 text-left shadow-[0_14px_35px_rgba(48,8,39,.18)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/16 hover:shadow-[0_20px_45px_rgba(48,8,39,.28)]"
                          >
                            <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/12 transition-transform duration-300 group-hover:scale-125" />
                            <div className="relative flex items-start gap-3">
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-[#5a1550] shadow-[0_10px_24px_rgba(0,0,0,.18)]"
                                style={{ backgroundColor: prizeIndex === 2 ? banner.accent : '#ffffff' }}
                              >
                                {prizeIndex === 2 ? '+' : prizeIndex + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.1em] text-white/78">
                                  {prize.label.toLowerCase().includes('extra') ? '4 premios de' : prize.label}
                                </p>
                                {prize.label.toLowerCase().includes('extra') ? (
                                  <div className="mt-2">
                                    <p className="text-3xl font-black leading-none tracking-tight text-white md:text-4xl">
                                      S/ 50
                                    </p>
                                  </div>
                                ) : (
                                  <p className="mt-2 text-3xl font-black leading-[0.95] tracking-tight text-white md:text-4xl">
                                    {prize.amount}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-4 md:mt-6 md:flex-row md:items-start">
                      {banner.paymentInfo && (
                        <div className="w-full max-w-[560px] rounded-[24px] bg-white p-3 text-[#211128] shadow-[0_24px_55px_rgba(52,8,43,.3)] ring-1 ring-white/70 sm:p-4 md:w-auto md:rounded-[28px]">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#4e1680] via-[#7518a0] to-[#9e1bb2] shadow-[inset_0_1px_0_rgba(255,255,255,.25)] sm:h-20 sm:w-20">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={YAPE_LOGO_URL}
                                alt="Yape"
                                className="h-full w-full scale-[1.38] object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6e2ca1]">
                                Pago oficial por Yape
                              </p>
                              <p className="mt-1 text-3xl font-black leading-none tracking-tight text-[#161320] sm:text-4xl md:text-5xl">
                                {banner.paymentInfo.phone}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 border-t border-[#ead8ef] pt-3 sm:grid-cols-[1fr_auto] sm:items-center">
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0d9ba3]">
                                Titular
                              </p>
                              <p className="text-sm font-black uppercase leading-tight text-[#5a1d64]">
                                {banner.paymentInfo.owner}
                              </p>
                            </div>
                            <div className="rounded-full bg-[#eefafa] px-4 py-2 text-sm font-black text-[#0b8f97]">
                              Envia tu comprobante
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col gap-3 ${banner.paymentInfo ? 'md:pt-3' : 'items-center md:flex-row md:items-center'}`}>
                        <button
                          onClick={() => document.getElementById('sorteos')?.scrollIntoView({ behavior: 'smooth' })}
                          className="rounded-full bg-white px-9 py-4 text-base font-bold uppercase tracking-[0.08em] text-[#6d1b57] shadow-[0_12px_30px_rgba(0,0,0,.2)] transition-all hover:-translate-y-0.5 hover:bg-[#fdf1f8]"
                        >
                          Ver sorteos activos
                        </button>
                        <div className={`text-white drop-shadow-[0_8px_18px_rgba(0,0,0,.35)] ${banner.paymentInfo ? 'text-center' : 'text-left'}`}>
                          <p className="text-sm font-bold uppercase tracking-[0.12em] text-white/86">
                            {banner.ticketCaption || 'Ticket desde'}
                          </p>
                          <p
                            className={`mt-1 flex items-baseline gap-2 whitespace-nowrap text-4xl font-black leading-none tracking-tight md:text-5xl ${banner.paymentInfo ? 'justify-center' : ''}`}
                            style={{ color: banner.accent }}
                          >
                            <span className="text-[0.78em] leading-none">S/</span>
                            <span>{banner.ticketPrice}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        <button
          onClick={() => handleManualNav((activeIndex - 1 + total) % total)}
          className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/25 p-2 text-white backdrop-blur transition hover:bg-black/40 md:block"
          aria-label="Anterior"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <button
          onClick={() => handleManualNav((activeIndex + 1) % total)}
          className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/25 p-2 text-white backdrop-blur transition hover:bg-black/40 md:block"
          aria-label="Siguiente"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 gap-2 md:flex">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleManualNav(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex ? 'w-9 bg-white' : 'w-3 bg-white/45 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        .rifa-impact-title {
          font-family: Impact, Haettenschweiler, "Arial Narrow", Arial, sans-serif;
          letter-spacing: 0.02em;
          text-shadow:
            2px 2px 0 rgba(0, 0, 0, 0.22),
            0 8px 18px rgba(0, 0, 0, 0.2);
        }
        .rifa-worker-headline {
          color: #efff1a;
          font-family: Impact, Haettenschweiler, "Arial Narrow", Arial, sans-serif;
          letter-spacing: 0.01em;
          text-shadow:
            3px 3px 0 rgba(20, 18, 22, 0.95),
            6px 7px 0 rgba(0, 0, 0, 0.28),
            0 16px 24px rgba(0, 0, 0, 0.32);
        }
        .rifa-script-title,
        .rifa-highlight-title {
          font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: none;
        }
        .rifa-highlight-title {
          color: #efff1a;
          text-shadow:
            3px 4px 0 rgba(20, 18, 22, 0.96),
            7px 8px 0 rgba(0, 0, 0, 0.28),
            0 16px 24px rgba(0, 0, 0, 0.32);
        }
        @media (min-width: 768px) {
          .rifa-highlight-title {
            font-size: clamp(4rem, 5.2vw, 6.2rem);
            white-space: nowrap;
          }
        }
      `}</style>
    </section>
  );
};

export default RifaSlider;
