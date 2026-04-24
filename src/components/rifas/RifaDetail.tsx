'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrophyIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface RifaDetailProps {
  selectedRifa: any;
  numbers: any;
  selectedNumbers: number[];
  toggleNumber: (num: number) => void;
  loading: boolean;
  bannerSlides: any[];
  currentSlide: number;
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void;
  onBack: () => void;
  router: any;
}

const getOptimizedVideoUrl = (url?: string) => {
  if (!url) return '';
  if (!url.includes('/video/upload/')) return url;
  if (url.includes('/video/upload/f_auto,q_auto')) return url;

  return url.replace('/video/upload/', '/video/upload/f_auto,q_auto:eco,c_limit,w_720/');
};

const RifaDetail = ({
  selectedRifa,
  numbers,
  selectedNumbers,
  toggleNumber,
  loading,
  bannerSlides,
  currentSlide,
  setCurrentSlide,
  onBack,
  router,
}: RifaDetailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adActive, setAdActive] = useState(Boolean(selectedRifa?.videoUrl));
  const [timer, setTimer] = useState(8);
  const optimizedVideoUrl = useMemo(() => getOptimizedVideoUrl(selectedRifa?.videoUrl), [selectedRifa?.videoUrl]);

  const targetDate = useMemo(() => {
    if (selectedRifa?.endDate) {
      const parsed = new Date(selectedRifa.endDate);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 7);
    return fallback;
  }, [selectedRifa?.endDate]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setAdActive(Boolean(selectedRifa?.videoUrl));
    setTimer(8);
  }, [selectedRifa?.id, selectedRifa?.videoUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    if (!adActive) return;
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, [adActive]);

  useEffect(() => {
    if (adActive && optimizedVideoUrl && videoRef.current) {
      videoRef.current.play().catch(() => null);
    }
  }, [adActive, optimizedVideoUrl]);

  const handleSkipAd = () => {
    if (videoRef.current) videoRef.current.pause();
    setAdActive(false);
  };

  const totalAmount = selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString());

  const endDateLabel = targetDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  if (adActive && optimizedVideoUrl) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={optimizedVideoUrl}
          autoPlay
          playsInline
          preload="metadata"
          controls={false}
          disablePictureInPicture
          className="h-full w-full object-contain"
          onEnded={handleSkipAd}
        />
        <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
          Presentación de la rifa
        </div>
        <button
          onClick={handleSkipAd}
          disabled={timer > 0}
          className="absolute bottom-8 right-6 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.15em] text-[#7a1f61] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {timer > 0 ? `Omitir en ${timer}s` : 'Entrar al sorteo'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fc] pb-24 pt-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-600 shadow-sm hover:text-[#7a1f61]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a rifas
        </button>

        <section className="mb-6 rounded-[1.8rem] border border-[#eed2e4] bg-white p-5 shadow-sm md:p-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7a1f61]">Rifa activa</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">{selectedRifa.title}</h1>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Dias', value: timeLeft.days.toString().padStart(2, '0') },
              { label: 'Horas', value: timeLeft.hours.toString().padStart(2, '0') },
              { label: 'Min', value: timeLeft.minutes.toString().padStart(2, '0') },
              { label: 'Seg', value: timeLeft.seconds.toString().padStart(2, '0') },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-[#fbf4f8] p-3 text-center">
                <p className="text-2xl font-black text-[#7a1f61] md:text-3xl">{item.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 md:text-sm">
            Cierre estimado: {endDateLabel}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <section className="overflow-hidden rounded-[1.8rem] border border-[#eed2e4] bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-[#f7eaf2]">
                {bannerSlides.length > 0 ? (
                  bannerSlides[currentSlide].type === 'image' ? (
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${bannerSlides[currentSlide].url})` }}
                    />
                  ) : (
                    <div className={`flex h-full items-center justify-center bg-gradient-to-br ${bannerSlides[currentSlide].gradient} p-8 text-center text-white`}>
                      <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">{bannerSlides[currentSlide].title}</h2>
                        <p className="mt-2 text-sm font-medium">{bannerSlides[currentSlide].subtitle}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <PhotoIcon className="h-14 w-14" />
                  </div>
                )}

                {bannerSlides.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {bannerSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full ${currentSlide === i ? 'w-8 bg-white' : 'w-3 bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#f4dbe9] p-4">
                <div className="rounded-xl bg-[#fbf4f8] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">Precio</p>
                  <p className="text-2xl font-black text-slate-900">S/ {parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-[#fbf4f8] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">Disponibles</p>
                  <p className="text-2xl font-black text-[#7a1f61]">{selectedRifa.availableNumbers}</p>
                </div>
              </div>
            </section>

            <section className="hidden rounded-[1.8rem] border border-[#eed2e4] bg-white p-5 shadow-sm lg:block">
              <div className="mb-4 flex items-center gap-2 border-b border-[#f4dbe9] pb-3">
                <ShoppingCartIcon className="h-5 w-5 text-[#7a1f61]" />
                <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700">Resumen</h3>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Total</p>
              <p className="text-4xl font-black text-slate-900">S/ {totalAmount.toFixed(2)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{selectedNumbers.length} número(s)</p>

              <button
                onClick={() => {
                  if (selectedNumbers.length === 0) {
                    alert('Selecciona al menos un número antes de continuar.');
                    return;
                  }
                  router.push(`/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`);
                }}
                disabled={selectedNumbers.length === 0 || loading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7a1f61] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-white hover:bg-[#62184e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                Continuar
                <ShoppingCartIcon className="h-4 w-4" />
              </button>

              <p className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <ShieldCheckIcon className="h-4 w-4 text-[#7a1f61]" />
                Proceso verificado por Rossy Resina
              </p>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-[1.8rem] border border-[#eed2e4] bg-white p-4 shadow-sm md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Cartilla</h3>
                <span className="rounded-full bg-[#7a1f61] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white">
                  {selectedNumbers.length} seleccionados
                </span>
              </div>

              {!loading ? (
                <div className="grid grid-cols-5 gap-2 md:grid-cols-8 lg:grid-cols-10">
                  {Array.from({ length: selectedRifa.totalNumbers }, (_, i) => i + 1).map((num) => {
                    const ticket = numbers?.tickets.find((t: any) => t.number === num);
                    const isSelected = selectedNumbers.includes(num);
                    const isAvailable = ticket?.status === 'AVAILABLE';

                    return (
                      <button
                        key={num}
                        onClick={() => isAvailable && toggleNumber(num)}
                        disabled={!isAvailable}
                        className={`aspect-square rounded-lg border text-sm font-extrabold transition-all ${
                          isSelected
                            ? 'border-[#7a1f61] bg-[#7a1f61] text-white'
                            : isAvailable
                            ? 'border-[#e6d2df] bg-white text-slate-800 hover:border-[#7a1f61] hover:text-[#7a1f61]'
                            : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                        }`}
                      >
                        {num.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e9c7dd] border-t-[#7a1f61]" />
                </div>
              )}
            </section>

            <section className="rounded-[1.8rem] border border-[#eed2e4] bg-white p-6 shadow-sm">
              <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">Como funciona</h4>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    icon: TicketIcon,
                    title: 'Selecciona',
                    desc: 'Elige números disponibles en la cartilla.',
                  },
                  {
                    icon: ShieldCheckIcon,
                    title: 'Paga',
                    desc: 'Sube tu comprobante en checkout.',
                  },
                  {
                    icon: TrophyIcon,
                    title: 'Participa',
                    desc: 'Entras al sorteo y validamos tus tickets.',
                  },
                ].map((item) => (
                  <article key={item.title} className="rounded-xl bg-[#fbf4f8] p-4 text-center">
                    <item.icon className="mx-auto h-8 w-8 text-[#7a1f61]" />
                    <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.1em] text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">{item.desc}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eed2e4] bg-white p-4 shadow-[0_-10px_30px_rgba(122,31,97,0.08)] lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">Total</p>
            <p className="truncate text-xl font-black text-slate-900">S/ {totalAmount.toFixed(2)}</p>
          </div>
          <button
            onClick={() => {
              if (selectedNumbers.length === 0) {
                alert('Selecciona al menos un número antes de continuar.');
                return;
              }
              router.push(`/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`);
            }}
            disabled={selectedNumbers.length === 0 || loading}
            className="rounded-full bg-[#7a1f61] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RifaDetail;
