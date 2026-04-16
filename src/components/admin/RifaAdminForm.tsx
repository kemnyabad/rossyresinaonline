import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface RifaFormData {
  title: string;
  description: string;
  totalNumbers: string;
  pricePerNumber: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DRAWN';
  rules: string;
}

export default function RifaAdminForm({ rifaId }: { rifaId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<RifaFormData>({
    title: '',
    description: '',
    totalNumbers: '1000',
    pricePerNumber: '5.00',
    image: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    rules: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (rifaId) {
      loadRifa();
    }
  }, [rifaId]);

  const loadRifa = async () => {
    try {
      const res = await fetch(`/api/admin/rifas/${rifaId}`);
      if (res.ok) {
        const rifa = await res.json();
        setData({
          title: rifa.title,
          description: rifa.description || '',
          totalNumbers: rifa.totalNumbers.toString(),
          pricePerNumber: rifa.pricePerNumber.toString(),
          image: rifa.image || '',
          startDate: rifa.startDate ? rifa.startDate.split('T')[0] : '',
          endDate: rifa.endDate ? rifa.endDate.split('T')[0] : '',
          status: rifa.status,
          rules: rifa.rules || '',
        });
        setImagePreview(rifa.image || '');
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = rifaId ? `/api/admin/rifas/${rifaId}` : '/api/admin/rifas';
      const method = rifaId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push('/admin/rifas');
      } else {
        alert('Error guardando');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      // Upload to public folder or S3 later
      setData({ ...data, image: file.name }); // Placeholder
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {rifaId ? 'Editar Rifa' : 'Nueva Rifa'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Números</label>
              <input
                type="number"
                value={data.totalNumbers}
                onChange={(e) => setData({ ...data, totalNumbers: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="10000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio por Número (S/)</label>
              <input
                type="number"
                step="0.01"
                value={data.pricePerNumber}
                onChange={(e) => setData({ ...data, pricePerNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={data.startDate}
                onChange={(e) => setData({ ...data, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={data.endDate}
                onChange={(e) => setData({ ...data, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {imagePreview && (
              <div className="mt-3">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activa</option>
              <option value="CLOSED">Cerrada</option>
              <option value="DRAWN">Sorteada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reglas</label>
            <textarea
              rows={4}
              value={data.rules}
              onChange={(e) => setData({ ...data, rules: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              placeholder="Reglas del sorteo..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Guardando...' : rifaId ? 'Actualizar Rifa' : 'Crear Rifa'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/rifas')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

