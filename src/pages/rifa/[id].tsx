import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RifaNumbersGrid from '@/components/rifas/RifaNumbersGrid';
import Image from 'next/image';
import { ArrowLeftIcon, TicketIcon, ClockIcon } from '@heroicons/react/24/outline';

interface RifaDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  totalNumbers: number;
  pricePerNumber: number;
  soldCount: number;
  startDate: string;
  endDate: string;
  rules: string;
}

export default function RifaDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [rifa, setRifa] = useState<RifaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRifa();
    }
  }, [id]);

  const fetchRifa = async () => {
    try {
      const res = await fetch(`/api/rifas`);
      if (res.ok) {
        const allRifas = await res.json();
        const found = allRifas.find((r: any) => r.id === id);
        setRifa(found);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
            <TicketIcon className="w-24 h-24" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rifa no encontrada</h2>
          <button 
            onClick={() => router.push('/rifas')}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
          >
            Ver todas las rifas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-8 text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver a rifas
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {rifa.title}
              </h1>
              <p className="text-xl text-purple-100 mb-8 max-w-lg leading-relaxed">
                {rifa.description}
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">S/ {rifa.pricePerNumber}</div>
                  <div className="text-purple-100">por número</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{rifa.soldCount}</div>
                  <div className="text-purple-100">vendidos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{rifa.totalNumbers - rifa.soldCount}</div>
                  <div className="text-purple-100">disponibles</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-64 lg:h-80 rounded-3xl overflow-hidden shadow-2xl bg-white/20 backdrop-blur-sm">
                {rifa.image ? (
                  <Image 
                    src={rifa.image} 
                    alt={rifa.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TicketIcon className="w-32 h-32 text-white/50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-16 -mt-12 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12">
          {/* Rules */}
          {rifa.rules && (
            <div className="mb-12 p-6 bg-gray-50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reglas</h3>
              <div className="prose max-w-none text-sm">{rifa.rules}</div>
            </div>
          )}

          {/* Numbers Grid */}
          <RifaNumbersGrid 
            rifaId={rifa.id} 
            pricePerNumber={rifa.pricePerNumber}
          />
        </div>
      </div>
    </div>
  );
}

