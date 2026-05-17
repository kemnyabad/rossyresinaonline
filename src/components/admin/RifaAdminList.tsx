import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  PlayIcon
} from '@heroicons/react/24/outline';

interface Rifa {
  id: string;
  title: string;
  totalNumbers: number;
  pricePerNumber: number;
  status: string;
  soldCount: number;
  winnerNumber?: number;
  _count: { tickets: number };
  image?: string;
  createdAt: string;
}

export default function RifaAdminList() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadRifas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rifas');
      if (!res.ok) throw new Error('Error loading');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRifas(data);
      }
    } catch {
      alert('Error cargando rifas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRifas();
  }, []);

  const deleteRifa = async (id: string) => {
    if (!confirm('¿Eliminar esta rifa y todos sus números?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/rifas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRifas(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Error eliminando');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon_blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Rifas</h1>
          <p className="text-sm text-gray-500">{rifas.length} rifa{rifas.length !== 1 ? 's' : ''} totales</p>
        </div>
        <Link href="/admin/rifas/new" className="flex items-center gap-2 px-4 py-2 bg-amazon_blue hover:bg-amazon_light text-white rounded-xl text-sm font-semibold transition-all">
          <PlusIcon className="w-4 h-4" />
          Nueva Rifa
        </Link>
      </div>

      {rifas.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
            <PlusIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay rifas</h3>
          <p className="text-gray-500 mb-6">Crea tu primera rifa para empezar.</p>
          <Link href="/admin/rifas/new" className="inline-flex items-center gap-2 px-6 py-2 bg-amazon_blue hover:bg-amazon_light text-white rounded-xl font-semibold">
            <PlusIcon className="w-4 h-4" />
            Crear primera rifa
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rifas.map((rifa) => {
            const sold = rifa._count.tickets;
            const percent = Math.round((sold / rifa.totalNumbers) * 100);
            return (
              <div key={rifa.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-amazon_blue/50 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {rifa.image ? (
                      <Image src={rifa.image} alt={rifa.title} width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amazon_blue to-brand_purple flex items-center justify-center">
                        <span className="text-white text-sm font-bold">RIFA</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{rifa.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      rifa.status === 'DRAWN' ? 'bg-emerald-100 text-emerald-800' :
                      rifa.status === 'ACTIVE' ? 'bg-amazon_blue/10 text-amazon_blue' :
                      rifa.status === 'CLOSED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rifa.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-amazon_blue">S/ {rifa.pricePerNumber}</div>
                      <div className="text-sm text-gray-500">Precio por número</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{sold}/{rifa.totalNumbers}</div>
                      <div className="text-sm text-gray-500">({percent}% vendido)</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amazon_blue h-2 rounded-full" style={{ width: `${percent}%` }} />
                  </div>

                  {rifa.winnerNumber && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="font-bold text-lg text-emerald-800">#{rifa.winnerNumber}</div>
                      <div className="text-sm text-emerald-700">Ganador sorteado</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 mt-6 border-t border-gray-100">
                  <Link 
                    href={`/admin/rifa/${rifa.id}`}
                    className="flex-1 text-center py-2 px-4 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-amazon_blue/50 transition-all"
                  >
                    <PencilSquareIcon className="w-5 h-5 inline mr-1" />
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteRifa(rifa.id)}
                    disabled={deleting === rifa.id}
                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 flex-1"
                  >
                    <TrashIcon className="w-5 h-5 inline mr-1" />
                    Eliminar
                  </button>
                  {rifa.status === 'CLOSED' && !rifa.winnerNumber && (
                    <button className="ml-auto px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-1">
                      <PlayIcon className="w-5 h-5" />
                      Sortear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

