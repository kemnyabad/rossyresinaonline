import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function RifaCheckoutPage() {
  const router = useRouter();
  const { rifaId, numbers: numbersQuery, quantity: quantityQuery } = router.query;

  const [rifa, setRifa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentPreview, setPaymentPreview] = useState('');

  const selectedNumbers = useMemo(() => {
    if (!numbersQuery) return [];
    return String(numbersQuery)
      .split(',')
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
  }, [numbersQuery]);

  const isAmphora = rifa?.raffleMode === 'AMPHORA';
  const selectedQuantity = useMemo(() => {
    const parsed = Number(quantityQuery);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }, [quantityQuery]);
  const entryCount = isAmphora ? selectedQuantity : selectedNumbers.length;
  const totalPrice = (entryCount * (rifa?.pricePerNumber || 0)).toFixed(2);

  useEffect(() => {
    if (!rifaId) return;
    setLoading(true);

    fetch('/api/rifas')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const found = Array.isArray(data) ? data.find((r: any) => r.id === rifaId) : null;
        if (found) setRifa(found);
        else setError('No se encontró la información de la rifa.');
      })
      .catch(() => setError('No se pudo cargar la rifa.'))
      .finally(() => setLoading(false));
  }, [rifaId]);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen supera 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
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
        setPaymentPreview(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = String(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentPreview) {
      setError('Debes subir el comprobante de pago.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/rifas/${rifaId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          quantity: selectedQuantity,
          buyerName: name,
          buyerPhone: phone,
          buyerEmail: 'cliente@web.com',
          paymentImage: paymentPreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.takenNumbers) {
          throw new Error(`Los números ${data.takenNumbers.join(', ')} ya fueron reservados. Elige otros e intenta de nuevo.`);
        }
        throw new Error(data.error || 'No se pudo procesar la reserva.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error inesperado al procesar la reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  if ((!numbersQuery || selectedNumbers.length === 0) && (!quantityQuery || selectedQuantity === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8fc] p-10 text-center">
        <p className="text-lg font-bold text-slate-700">No seleccionaste participación.</p>
        <Link href="/rifas" className="mt-4 rounded-full bg-[#7a1f61] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white">
          Volver a rifas
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8fc] px-4">
        <div className="w-full max-w-lg rounded-[1.8rem] border border-[#eed2e4] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">✓</div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Reserva enviada</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
            Estamos verificando tu comprobante. Te contactaremos al {phone} cuando tus tickets queden confirmados.
          </p>
          <Link href="/rifas" className="mt-6 inline-block rounded-full bg-[#7a1f61] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white">
            Volver a rifas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fc] px-4 py-8 md:px-6 md:py-10">
      <Head>
        <title>Checkout de Rifa | Rossy Resina</title>
      </Head>

      <div className="mx-auto w-full max-w-7xl">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 shadow-sm hover:text-[#7a1f61]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-5 rounded-[1.8rem] border border-[#eed2e4] bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Finalizar participación</h1>

            <div className="rounded-2xl bg-[#fbf4f8] p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a1f61]">Sorteo seleccionado</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">{loading ? 'Cargando...' : rifa?.title || 'Rifa no disponible'}</h2>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                {isAmphora ? 'Tickets al ánfora' : 'Números'}
              </p>
              {isAmphora ? (
                <div className="mt-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-600">
                    Tu nombre ingresará <strong>{selectedQuantity}</strong> vez{selectedQuantity === 1 ? '' : 'es'} al ánfora.
                  </p>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedNumbers.map((n) => (
                    <span key={n} className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#7a1f61] shadow-sm">
                      #{n.toString().padStart(2, '0')}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-[#eed2e4] pt-4">
                <span className="text-sm font-bold uppercase tracking-[0.1em] text-slate-600">Total</span>
                <span className="text-3xl font-black text-[#7a1f61]">S/ {totalPrice}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8efd8] bg-[#f2fbf2] p-5">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                <ShieldCheckIcon className="h-4 w-4" />
                Pago seguro
              </p>
              <p className="text-sm font-medium text-slate-700">1. Yapea al <strong>961770723</strong>.</p>
              <p className="text-sm font-medium text-slate-700">2. Toma captura del comprobante.</p>
              <p className="text-sm font-medium text-slate-700">3. Súbelo en el formulario para validar tu reserva.</p>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-[1.8rem] border border-[#eed2e4] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Datos de contacto</h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Nombre completo</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juan Perez"
                  className="mt-2 w-full rounded-xl border border-[#e5d0df] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#7a1f61]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Celular / WhatsApp</span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="999888777"
                  className="mt-2 w-full rounded-xl border border-[#e5d0df] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#7a1f61]"
                />
              </label>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Comprobante</span>
                <div className="relative mt-2 rounded-xl border-2 border-dashed border-[#e5d0df] bg-[#fffafd] p-5 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  {paymentPreview ? (
                    <div>
                      <img src={paymentPreview} alt="Comprobante" className="mx-auto max-h-56 rounded-lg shadow-sm" />
                      <p className="mt-2 text-xs font-semibold text-slate-500">Toca para reemplazar la imagen</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl">📸</p>
                      <p className="mt-2 text-sm font-bold text-slate-700">Sube tu captura de pago</p>
                      <p className="text-xs font-semibold text-slate-500">Maximo 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !paymentPreview}
              className="mt-6 w-full rounded-full bg-[#7a1f61] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[#62184e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {submitting ? 'Procesando...' : 'Confirmar participación'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
