import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';

interface NumberGridProps {
  rifaId: string;
  pricePerNumber: number;
  onNumbersSelected?: (numbers: number[]) => void;
}

export default function RifaNumbersGrid({ rifaId, pricePerNumber, onNumbersSelected }: NumberGridProps) {
  const router = useRouter();
  const [numbers, setNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 100;

  const fetchNumbers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rifas/${rifaId}/numbers?status=AVAILABLE&page=${page}&limit=${LIMIT}`);
      const data = await res.json();
      setNumbers(data.tickets.map((t: any) => t.number));
    } catch {
      alert('Error cargando números');
    } finally {
      setLoading(false);
    }
  }, [rifaId]);

  useEffect(() => {
    fetchNumbers(1);
  }, [fetchNumbers]);

  const toggleNumber = (num: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(num)) {
      newSelected.delete(num);
    } else {
      newSelected.add(num);
    }
    setSelected(newSelected);
    onNumbersSelected?.(Array.from(newSelected));
  };

  const totalPrice = Array.from(selected).length * pricePerNumber;

  const nextPage = () => {
    setCurrentPage(p => p + 1);
    fetchNumbers(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      fetchNumbers(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Selecciona tus números</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">S/ {pricePerNumber} por número</div>
          <div className="text-2xl font-bold text-green-600">
            Total: S/ {totalPrice.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">{selected.size} números seleccionados</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-10 md:grid-cols-20 gap-2 p-4 bg-gray-50 rounded-2xl min-h-[400px]">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : numbers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay números disponibles
          </div>
        ) : (
          numbers.map(num => (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-xl font-bold text-sm border-4 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center ${
                selected.has(num)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:scale-105'
              }`}
            >
              {num.toString().padStart(3, '0')}
            </button>
          ))
        )}
      </div>

      {/* Pagination */}
      {numbers.length === LIMIT && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span>Página {currentPage}</span>
          <button
            onClick={nextPage}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {selected.size > 0 && (
        <div className="flex gap-4 pt-6">
          <button
            onClick={() => setSelected(new Set())}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Limpiar selección
          </button>
          <button 
            onClick={() => {
              const numbersArray = Array.from(selected).sort((a, b) => a - b);
              router.push(`/rifas/checkout?rifaId=${rifaId}&numbers=${numbersArray.join(',')}`);
            }}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Ir al Carrito ({selected.size} números - S/ {totalPrice.toFixed(2)})
          </button>
        </div>
      )}
    </div>
  );
}

