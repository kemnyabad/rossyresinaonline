import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Rifa {
  id: string;
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
  totalNumbers: number;
  pricePerNumber: number;
  startDate: string;
  endDate: string;
  rules: string;
  soldCount: number;
  availableNumbers: number;
}

interface RifaNumbersData {
  tickets: Array<{
    id: string;
    number: number;
    status: string;
    buyerName?: string;
    buyerEmail?: string;
  }>;
  total: number;
}

export default function RifasPage() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [numbers, setNumbers] = useState<RifaNumbersData | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
    try {
      const res = await fetch('/api/rifas');
      const data = await res.json();
      setRifas(data);
    } catch (error) {
      console.error('Error fetching rifas:', error);
    }
  };

  const handleSelectRifa = async (rifa: Rifa) => {
    setSelectedRifa(rifa);
    setSelectedNumbers([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/rifas/${rifa.id}/numbers?status=AVAILABLE&limit=1000`);
      const data = await res.json();
      setNumbers(data);
    } catch (error) {
      console.error('Error fetching numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNumber = (number: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  const handleBuy = async () => {
    if (selectedNumbers.length === 0) {
      alert('Selecciona al menos un número');
      return;
    }
    setShowBuyerForm(true);
  };

  const handleSubmitBuyer = async () => {
    if (!buyerData.name || !buyerData.email || !buyerData.phone) {
      alert('Completa todos los datos');
      return;
    }

    if (!selectedRifa) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rifas/${selectedRifa.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          buyerName: buyerData.name,
          buyerEmail: buyerData.email,
          buyerPhone: buyerData.phone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error);
        return;
      }

      const result = await res.json();
      router.push(`/rifas/${selectedRifa.id}/payment?tickets=${result.tickets.map((t: any) => t.id).join(',')}`);
    } catch (error) {
      console.error('Error buying:', error);
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRifa) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-purple-900">Nuestras Rifas</h1>

          {rifas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay rifas disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rifas.map((rifa) => (
                <div key={rifa.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {rifa.image && (
                    <img
                      src={rifa.image}
                      alt={rifa.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-purple-900">{rifa.title}</h3>
                    <p className="text-gray-600 mb-4">{rifa.description}</p>

                    <div className="mb-4 space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Precio por número:</span>
                        <span className="font-bold text-purple-600">S/ {parseFloat(rifa.pricePerNumber.toString()).toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Números disponibles:</span>
                        <span className={`font-bold ${rifa.availableNumbers > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rifa.availableNumbers} / {rifa.totalNumbers}
                        </span>
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((rifa.totalNumbers - rifa.availableNumbers) / rifa.totalNumbers) * 100}%`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => handleSelectRifa(rifa)}
                      disabled={rifa.availableNumbers === 0}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                    >
                      {rifa.availableNumbers > 0 ? 'Participar' : 'Completada'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => {
            setSelectedRifa(null);
            setSelectedNumbers([]);
            setShowBuyerForm(false);
          }}
          className="mb-6 text-purple-600 hover:text-purple-800 font-semibold"
        >
          ← Volver a rifas
        </button>

        {/* Banner de la Rifa */}
        <div className="mb-8 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none hidden md:block">
            <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 md:p-12 relative z-10">
            {/* Imagen del Banner */}
            <div className="order-2 md:order-1 relative h-72 rounded-xl overflow-hidden shadow-2xl bg-black/10 border-2 border-white/20">
              {selectedRifa.videoUrl ? (
                <video 
                  src={selectedRifa.videoUrl} 
                  autoPlay loop muted playsInline 
                  className="w-full h-full object-cover"
                />
              ) : selectedRifa.image ? (
                <img
                  src={selectedRifa.image}
                  alt={selectedRifa.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            {/* Texto del Banner */}
            <div className="order-1 md:order-2 text-white">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
                🌸 Especial: Feliz Día Mamá
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                SORTEO "{selectedRifa.title}"
              </h1>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-100">Inversión</p>
                    <p className="text-2xl font-bold">S/ {parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-100">Separados</p>
                    <p className="text-2xl font-bold">{selectedRifa.totalNumbers - selectedRifa.availableNumbers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-100">Libres</p>
                    <p className="text-2xl font-bold">{selectedRifa.availableNumbers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de la rifa */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-4 text-purple-900">{selectedRifa.title}</h2>
              <p className="text-gray-600 mb-4">{selectedRifa.description}</p>

              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-1">Precio por número</p>
                <p className="text-3xl font-bold text-purple-600">
                  S/ {parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-semibold text-yellow-900 mb-2">Total a pagar:</p>
                <p className="text-2xl font-bold text-yellow-600">
                  S/ {(selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString())).toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {selectedNumbers.length} número{selectedNumbers.length !== 1 ? 's' : ''} seleccionado{selectedNumbers.length !== 1 ? 's' : ''}
                </p>
              </div>

              {selectedRifa.rules && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Bases y condiciones:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedRifa.rules}</p>
                </div>
              )}
            </div>
          </div>

          {/* Selector de números */}
          <div className="lg:col-span-2">
            {loading && numbers === null ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando números disponibles...</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Selecciona tus números
                  </h3>

                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-6">
                    {Array.from({ length: selectedRifa.totalNumbers }, (_, i) => i + 1).map((num) => {
                      const ticket = numbers?.tickets.find((t) => t.number === num);
                      const isSelected = selectedNumbers.includes(num);
                      const isAvailable = ticket?.status === 'AVAILABLE';

                      return (
                        <button
                          key={num}
                          onClick={() => {
                            if (isAvailable) toggleNumber(num);
                          }}
                          disabled={!isAvailable}
                          className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                            isSelected
                              ? 'bg-green-500 text-white border-2 border-green-600'
                              : isAvailable
                              ? 'bg-gray-100 text-gray-900 hover:bg-purple-100 border-2 border-gray-200'
                              : 'bg-red-100 text-gray-500 border-2 border-red-300 cursor-not-allowed'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded" />
                        <span className="text-sm text-gray-600">Disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-sm text-gray-600">Seleccionado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                        <span className="text-sm text-gray-600">Vendido</span>
                      </div>
                    </div>
                  </div>

                  {!showBuyerForm && (
                    <button
                      onClick={() => {
                        if (selectedNumbers.length === 0) {
                          alert('Selecciona al menos un número');
                          return;
                        }
                        router.push(`/rifas/checkout?rifaId=${selectedRifa.id}&numbers=${selectedNumbers.join(',')}`);
                      }}
                      disabled={selectedNumbers.length === 0 || loading}
                      className="w-full py-3 px-4 bg-amazon_blue text-white rounded-lg font-semibold hover:bg-amazon_blue disabled:bg-gray-400 transition-colors"
                    >
                      Ir al Carrito ({selectedNumbers.length} números - S/ {(selectedNumbers.length * parseFloat(selectedRifa.pricePerNumber.toString())).toFixed(2)})
                    </button>
                  )}
                </div>

                {/* Buyer form removed - now handled in checkout page */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
