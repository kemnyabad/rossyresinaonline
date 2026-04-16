import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

export default function RifaCheckoutPage() {
  const router = useRouter();
  const { rifaId, numbers: numbersQuery } = router.query;

  const [rifa, setRifa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Campos del formulario
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentPreview, setPaymentPreview] = useState("");

  const selectedNumbers = useMemo(() => {
    if (!numbersQuery) return [];
    return String(numbersQuery).split(",").map(Number).sort((a, b) => a - b);
  }, [numbersQuery]);

  useEffect(() => {
    if (rifaId) {
      // Cargamos los datos de la rifa para mostrar el precio y título
      fetch(`/api/rifas`) 
        .then(res => res.json())
        .then(data => {
          const found = data.find((r: any) => r.id === rifaId);
          setRifa(found);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [rifaId]);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen es muy pesada (máximo 10MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPaymentPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentPreview) {
      setError("Debes subir la captura de tu Yape o transferencia");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/rifas/${rifaId}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: selectedNumbers,
          buyerName: name,
          buyerPhone: phone,
          buyerEmail: "cliente@web.com", // Campo requerido por tu API actual
          paymentImage: paymentPreview,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Cargando datos de la rifa...</div>;
  
  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
        <h1 className="text-2xl font-bold">¡Números Separados con éxito!</h1>
        <p className="text-gray-600 mt-2">Estamos verificando tu pago. Nos contactaremos al {phone} para confirmar.</p>
        <Link href="/rifas" className="mt-8 inline-block bg-amazon_blue text-white px-8 py-3 rounded-xl font-bold shadow-lg">Volver a Rifas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <Head><title>Confirmar Números | Rossy Resina</title></Head>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Finalizar Reserva</h1>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg text-purple-600">{rifa?.title}</h2>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Números seleccionados:</p>
              <div className="flex flex-wrap gap-2">
                {selectedNumbers.map(n => (
                  <span key={n} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold">#{n}</span>
                ))}
              </div>
            </div>
            <div className="mt-6 border-t pt-4 flex justify-between items-center font-bold text-xl">
              <span>Total a pagar:</span>
              <span className="text-amazon_blue">S/ {(selectedNumbers.length * (rifa?.pricePerNumber || 0)).toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <p className="font-bold text-blue-800 flex items-center gap-2"><span>📱</span> Instrucciones de Pago:</p>
            <p className="mt-2 text-sm text-blue-900">1. Yapea al <strong>961770723</strong> (Rossy Resina).</p>
            <p className="text-sm text-blue-900">2. Toma una captura de pantalla del comprobante.</p>
            <p className="text-sm text-blue-900">3. Súbela en el formulario de la derecha.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Tu Nombre Completo</span>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amazon_blue outline-none" placeholder="Juan Pérez..." />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Celular / WhatsApp</span>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amazon_blue outline-none" placeholder="999888777" />
          </label>
          <div>
            <span className="text-sm font-semibold text-gray-700">Subir Comprobante (Yape/Transferencia)</span>
            <div className="mt-1 relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amazon_blue transition-colors bg-gray-50">
              <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              {paymentPreview ? (
                <div className="relative inline-block">
                  <img src={paymentPreview} alt="Captura" className="max-h-48 rounded-lg shadow-md mx-auto" />
                  <p className="text-xs text-amazon_blue mt-2 font-semibold">Toca para cambiar la imagen</p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-gray-600 font-medium">Toca aquí para subir o tomar foto</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase">JPG, PNG (Máximo 10MB)</p>
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          <button disabled={submitting} className="w-full bg-amazon_blue text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-lg active:scale-95">
            {submitting ? "Procesando..." : "Confirmar mi participación"}
          </button>
        </form>
      </div>
    </div>
  );
}