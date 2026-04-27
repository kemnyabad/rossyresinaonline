'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrophyIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const ThreeDAnfora = dynamic(() => import('./ThreeDAnfora'), { ssr: false });

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
  onAdComplete?: () => void;
  router: any;
}

const getOptimizedVideoUrl = (url?: string, isMobile = false) => {
  if (!url) return '';
  if (!url.includes('/video/upload/')) return url;
  if (url.includes('/video/upload/f_auto,q_auto')) return url;

  const transform = isMobile ? 'f_auto,q_auto:low,c_limit,w_420' : 'f_auto,q_auto:eco,c_limit,w_720';
  return url.replace('/video/upload/', `/video/upload/${transform}/`);
};

const displayParticipantName = (name?: string) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Participante';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
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
  onAdComplete,
  router,
}: RifaDetailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adCompleteRef = useRef(false);
  const amphoraPaymentInputRef = useRef<HTMLInputElement>(null);
  const [adActive, setAdActive] = useState(Boolean(selectedRifa?.videoUrl));
  const [timer, setTimer] = useState(8);
  const [isMobileVideo, setIsMobileVideo] = useState(false);
  const [amphoraQuantity, setAmphoraQuantity] = useState(1);
  const [amphoraName, setAmphoraName] = useState('');
  const [amphoraPhone, setAmphoraPhone] = useState('');
  const [amphoraPayment, setAmphoraPayment] = useState('');
  const [amphoraSubmitting, setAmphoraSubmitting] = useState(false);
  const [amphoraMessage, setAmphoraMessage] = useState('');
  const [amphoraParticipants, setAmphoraParticipants] = useState<string[]>([]);
  const [amphoraSpinKey, setAmphoraSpinKey] = useState(0);
  const optimizedVideoUrl = useMemo(
    () => getOptimizedVideoUrl(selectedRifa?.videoUrl, isMobileVideo),
    [selectedRifa?.videoUrl, isMobileVideo]
  );

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
    adCompleteRef.current = false;
  }, [selectedRifa?.id, selectedRifa?.videoUrl]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileVideo(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (selectedRifa?.raffleMode !== 'AMPHORA') return;

    fetch(`/api/rifas/${selectedRifa.id}/participants`)
      .then((res) => (res.ok ? res.json() : { participants: [] }))
      .then((data) => {
        setAmphoraParticipants(Array.isArray(data.participants) ? data.participants : []);
      })
      .catch(() => setAmphoraParticipants([]));
  }, [selectedRifa?.id, selectedRifa?.raffleMode]);

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
    if (!adCompleteRef.current) {
      adCompleteRef.current = true;
      onAdComplete?.();
    }
  };

  const handleAmphoraPaymentFile = (file?: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAmphoraMessage('La captura no debe superar 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > 1200) {
          height = Math.round(height * (1200 / width));
          width = 1200;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        setAmphoraPayment(canvas.toDataURL('image/jpeg', 0.8));
        setAmphoraMessage('');
      };
      img.src = String(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const updateAmphoraQuantity = (nextQuantity: number) => {
    const normalized = Math.max(1, Math.floor(nextQuantity || 1));
    setAmphoraQuantity(normalized);
    setAmphoraMessage('');
    setAmphoraSpinKey((prev) => prev + 1);
  };

  const resetAmphoraForm = () => {
    setAmphoraName('');
    setAmphoraPhone('');
    setAmphoraPayment('');
    setAmphoraQuantity(1);
    setAmphoraMessage('');
    if (amphoraPaymentInputRef.current) {
      amphoraPaymentInputRef.current.value = '';
    }
  };

  const submitAmphoraEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amphoraName.trim() || !amphoraPhone.trim() || !amphoraPayment) {
      setAmphoraMessage('Completa tu nombre, WhatsApp y captura de pago.');
      return;
    }

    setAmphoraSubmitting(true);
    setAmphoraMessage('');

    try {
      const res = await fetch(`/api/rifas/${selectedRifa.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: amphoraQuantity,
          buyerName: amphoraName.trim(),
          buyerPhone: amphoraPhone.trim(),
          buyerEmail: 'cliente@web.com',
          paymentImage: amphoraPayment,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar tu participación.');

      setAmphoraMessage(`Listo. Tu nombre entrará ${amphoraQuantity} vez${amphoraQuantity === 1 ? '' : 'es'} al ánfora cuando validemos tu pago.`);
      setAmphoraName('');
      setAmphoraPhone('');
      setAmphoraPayment('');
      setAmphoraQuantity(1);
      if (amphoraPaymentInputRef.current) {
        amphoraPaymentInputRef.current.value = '';
      }
      setAmphoraParticipants((prev) => [
        ...Array.from({ length: amphoraQuantity }, () => displayParticipantName(amphoraName.trim())),
        ...prev,
      ].slice(0, 36));
    } catch (error: any) {
      setAmphoraMessage(error?.message || 'Error inesperado al registrar tu participación.');
    } finally {
      setAmphoraSubmitting(false);
    }
  };

  const totalAmount = selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString());
  const isAmphoraRaffle = selectedRifa?.raffleMode === 'AMPHORA';
  const amphoraTotalAmount = amphoraQuantity * parseFloat(selectedRifa.pricePerNumber.toString());
  const currentParticipantName = displayParticipantName(amphoraName);
  const amphoraVisualNames = [
    ...Array.from({ length: Math.min(amphoraQuantity, 12) }, () => currentParticipantName),
    ...amphoraParticipants,
  ];

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
                  <p className="text-2xl font-black text-[#7a1f61]">{isAmphoraRaffle ? 'Sin limite' : selectedRifa.availableNumbers}</p>
                </div>
              </div>
            </section>

            <section className="hidden rounded-[1.8rem] border border-[#eed2e4] bg-white p-5 shadow-sm lg:block">
              <div className="mb-4 flex items-center gap-2 border-b border-[#f4dbe9] pb-3">
                <ShoppingCartIcon className="h-5 w-5 text-[#7a1f61]" />
                <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700">Resumen</h3>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Total</p>
              <p className="text-4xl font-black text-slate-900">S/ {(isAmphoraRaffle ? amphoraTotalAmount : totalAmount).toFixed(2)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {isAmphoraRaffle ? `${amphoraQuantity} ticket(s) al ánfora` : `${selectedNumbers.length} número(s)`}
              </p>

              <button
                onClick={() => {
                  if (!isAmphoraRaffle && selectedNumbers.length === 0) {
                    alert('Selecciona al menos un número antes de continuar.');
                    return;
                  }
                  const target = isAmphoraRaffle
                    ? `/rifas/checkout?rifaId=${selectedRifa.id}&quantity=${amphoraQuantity}`
                    : `/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`;
                  router.push(target);
                }}
                disabled={(!isAmphoraRaffle && selectedNumbers.length === 0) || loading}
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
            {isAmphoraRaffle ? (
              <section className="overflow-hidden rounded-[1.8rem] border border-[#eed2e4] bg-white shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-[0.86fr_1.14fr]">
                  <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#7a1f61] via-[#b83586] to-[#f079aa] p-7 text-white">
                    <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_30%_25%,rgba(255,255,255,.45),transparent_24%),linear-gradient(135deg,rgba(255,255,255,.18),transparent_45%)]" />
                    <div className="relative flex w-full max-w-[360px] flex-col items-center">
                      <ThreeDAnfora
                        participants={amphoraParticipants}
                        activeName={currentParticipantName}
                        entryCount={amphoraQuantity}
                        spinPulseKey={amphoraSpinKey}
                      />
                      <p className="mt-4 max-w-[260px] text-center text-xs font-black uppercase tracking-[0.16em] text-white/85">
                        Tu nombre entra una vez por cada ticket
                      </p>
                    </div>
                  </div>

                  <form onSubmit={submitAmphoraEntry} className="p-5 md:p-7">
                    <div className="max-w-xl">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7a1f61]">Participación por ánfora</p>
                      <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">Compra tus tickets</h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                        No escoges número. Compra la cantidad que quieras y tu nombre se coloca esa cantidad de veces en el ánfora.
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Nombre completo</span>
                        <input
                          required
                          value={amphoraName}
                          onChange={(e) => {
                            setAmphoraName(e.target.value);
                            setAmphoraMessage('');
                          }}
                          placeholder="Ej: Rosa Perez"
                          className="mt-2 w-full rounded-xl border border-[#e5d0df] px-4 py-3 text-sm font-medium outline-none focus:border-[#7a1f61]"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">WhatsApp</span>
                        <input
                          required
                          type="tel"
                          value={amphoraPhone}
                          onChange={(e) => {
                            setAmphoraPhone(e.target.value);
                            setAmphoraMessage('');
                          }}
                          placeholder="999888777"
                          className="mt-2 w-full rounded-xl border border-[#e5d0df] px-4 py-3 text-sm font-medium outline-none focus:border-[#7a1f61]"
                        />
                      </label>

                      <div className="sm:col-span-2 rounded-2xl border border-[#f0d7e8] bg-[#fbf4f8] p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Cantidad de tickets</span>
                            <p className="mt-1 text-xs font-semibold text-slate-500">Sin límite máximo para este sorteo.</p>
                          </div>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateAmphoraQuantity(amphoraQuantity - 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-black text-[#7a1f61] shadow-sm transition active:scale-95"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={amphoraQuantity}
                            onChange={(e) => updateAmphoraQuantity(Number(e.target.value))}
                            className="h-14 w-28 rounded-2xl border border-[#e5d0df] bg-white text-center text-2xl font-black text-slate-900 outline-none focus:border-[#7a1f61]"
                          />
                          <button
                            type="button"
                            onClick={() => updateAmphoraQuantity(amphoraQuantity + 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-black text-[#7a1f61] shadow-sm transition active:scale-95"
                          >
                            +
                          </button>
                        </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-white px-4 py-3 text-center md:text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total a pagar</p>
                          <p className="text-3xl font-black text-[#7a1f61]">S/ {amphoraTotalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <label className="block sm:col-span-2">
                        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Captura de pago</span>
                        <div className="relative mt-2 rounded-xl border-2 border-dashed border-[#e5d0df] bg-[#fffafd] p-4 text-center">
                          <input
                            ref={amphoraPaymentInputRef}
                            type="file"
                            accept="image/*"
                            onClick={(e) => {
                              e.currentTarget.value = '';
                            }}
                            onChange={(e) => handleAmphoraPaymentFile(e.target.files?.[0])}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                          {amphoraPayment ? (
                            <div>
                              <img src={amphoraPayment} alt="Comprobante" className="mx-auto max-h-44 rounded-lg shadow-sm" />
                              <p className="mt-2 text-xs font-semibold text-slate-500">Toca para reemplazar</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-2xl">📸</p>
                              <p className="mt-1 text-sm font-bold text-slate-700">Sube tu captura de pago</p>
                              <p className="text-xs font-semibold text-slate-500">Maximo 5MB</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    {amphoraMessage && (
                      <div className="mt-4 rounded-xl border border-[#eed2e4] bg-[#fff8fc] p-3 text-sm font-semibold text-[#7a1f61]">
                        <p>{amphoraMessage}</p>
                        {amphoraMessage.startsWith('Listo.') && (
                          <button
                            type="button"
                            onClick={resetAmphoraForm}
                            className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#7a1f61] underline underline-offset-4"
                          >
                            Registrar otro participante
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={amphoraSubmitting}
                      className="mt-5 w-full rounded-full bg-[#7a1f61] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-white hover:bg-[#62184e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {amphoraSubmitting ? 'Registrando...' : 'Registrar participación'}
                    </button>
                  </form>
                </div>
              </section>
            ) : (
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
            )}

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

      {!isAmphoraRaffle && (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eed2e4] bg-white p-4 shadow-[0_-10px_30px_rgba(122,31,97,0.08)] lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">Total</p>
            <p className="truncate text-xl font-black text-slate-900">S/ {(isAmphoraRaffle ? amphoraTotalAmount : totalAmount).toFixed(2)}</p>
          </div>
          <button
            onClick={() => {
              if (!isAmphoraRaffle && selectedNumbers.length === 0) {
                alert('Selecciona al menos un número antes de continuar.');
                return;
              }
              const target = isAmphoraRaffle
                ? `/rifas/checkout?rifaId=${selectedRifa.id}&quantity=${amphoraQuantity}`
                : `/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`;
              router.push(target);
            }}
            disabled={(!isAmphoraRaffle && selectedNumbers.length === 0) || loading}
            className="rounded-full bg-[#7a1f61] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Continuar
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default RifaDetail;
