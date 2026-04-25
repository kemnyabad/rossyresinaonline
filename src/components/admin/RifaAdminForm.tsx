import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface RifaFormData {
  title: string;
  description: string;
  totalNumbers: string;
  pricePerNumber: string;
  image: string;
  prizeImages: { url: string; alt: string }[];
  videoUrl: string;
  prizes: string;
  raffleMode: 'NUMBERS' | 'AMPHORA';
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DRAWN';
  rules: string;
}

const normalizePrizeImages = (raw: any): Array<{ url: string; alt: string }> => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      if (typeof item === 'string') {
        const url = item.trim();
        return url ? { url, alt: 'Premio de la rifa' } : null;
      }
      const url = String(item?.url || '').trim();
      if (!url) return null;
      const alt = String(item?.alt || 'Premio de la rifa').trim();
      return { url, alt };
    })
    .filter(Boolean) as Array<{ url: string; alt: string }>;
};

interface RifaFormProps {
  rifaId?: string;
  initialData?: any;
}

export default function RifaAdminForm({ rifaId, initialData }: RifaFormProps) {
  const router = useRouter();
  const [data, setData] = useState<RifaFormData>({
    title: '',
    description: '',
    totalNumbers: '1000',
    pricePerNumber: '5.00',
    image: '',
    prizeImages: [],
    videoUrl: '',
    prizes: '',
    raffleMode: 'NUMBERS',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    rules: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedPrizeFiles, setSelectedPrizeFiles] = useState<File[]>([]);
  const [newPrizePreviews, setNewPrizePreviews] = useState<Array<{ url: string; alt: string }>>([]);

  useEffect(() => {
    if (initialData) {
      setData({
        title: initialData.title,
        description: initialData.description || '',
        totalNumbers: initialData.totalNumbers.toString(),
        pricePerNumber: initialData.pricePerNumber.toString(),
        image: initialData.image || '',
        prizeImages: normalizePrizeImages(initialData.prizeImages),
        videoUrl: initialData.videoUrl || '',
        prizes: initialData.prizes || '',
        raffleMode: initialData.raffleMode === 'AMPHORA' ? 'AMPHORA' : 'NUMBERS',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        status: initialData.status,
        rules: initialData.rules || '',
      });
      setImagePreview(initialData.image || '');
      setVideoPreview(initialData.videoUrl || '');
      setSelectedPrizeFiles([]);
      setNewPrizePreviews([]);
    } else if (rifaId) {
      loadRifa();
    }
  }, [rifaId, initialData]);

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
          prizeImages: normalizePrizeImages(rifa.prizeImages),
          videoUrl: rifa.videoUrl || '',
          prizes: rifa.prizes || '',
          raffleMode: rifa.raffleMode === 'AMPHORA' ? 'AMPHORA' : 'NUMBERS',
          startDate: rifa.startDate ? rifa.startDate.split('T')[0] : '',
          endDate: rifa.endDate ? rifa.endDate.split('T')[0] : '',
          status: rifa.status,
          rules: rifa.rules || '',
        });
        setImagePreview(rifa.image || '');
        setVideoPreview(rifa.videoUrl || '');
        setSelectedPrizeFiles([]);
        setNewPrizePreviews([]);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo cargar la rifa');
      }
    } catch (error: any) {
      console.error('Error loading rifa:', error);
      alert(`Error cargando la rifa: ${error?.message || 'Intenta recargar la página'}`);
    }
  };

  const uploadFile = async (f: File): Promise<string> => {
    const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const dataUrl = await toDataUrl(f);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: f.name, data: dataUrl }),
    });
    if (!res.ok) throw new Error("Error al subir archivo");
    const json = await res.json();
    return json.url;
  };

  const uploadVideoFile = async (f: File): Promise<string> => {
    try {
      console.log(`Uploading video: ${f.name}, size: ${(f.size / 1024 / 1024).toFixed(2)}MB`);
      
      if (f.size > 500 * 1024 * 1024) {
        throw new Error('Video muy grande. Máximo 500MB. Tu video pesa ' + (f.size / 1024 / 1024).toFixed(1) + 'MB');
      }

      const res = await fetch("/api/upload-video", {
        method: "POST",
        headers: { 'Content-Type': f.type || 'application/octet-stream' },
        body: f,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      if (!json.url) {
        throw new Error('No se recibió URL del video desde Cloudinary');
      }
      console.log('Video uploaded successfully:', json.url);
      return json.url;
    } catch (error: any) {
      console.error('Video upload error:', error);
      throw new Error(error?.message || 'Error desconocido al subir video');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar que imagen, video y premios son obligatorios
      if (!data.image && !selectedImageFile) {
        alert('La imagen es obligatoria');
        setLoading(false);
        return;
      }

      if (!data.videoUrl && !selectedVideoFile) {
        alert('El video es obligatorio');
        setLoading(false);
        return;
      }

      if (!data.prizes || data.prizes.trim() === '') {
        alert('Los premios son obligatorios');
        setLoading(false);
        return;
      }

      let finalData = { ...data };

      // Upload image if selected
      if (selectedImageFile) {
        try {
          console.log('Uploading image...');
          const imageUrl = await uploadFile(selectedImageFile);
          finalData.image = imageUrl;
          console.log('Image uploaded successfully');
        } catch (err: any) {
          alert(`Error al subir imagen: ${err.message}`);
          setLoading(false);
          return;
        }
      }

      // Upload video if selected
      if (selectedVideoFile) {
        try {
          console.log('Uploading video...');
          const videoUrl = await uploadVideoFile(selectedVideoFile);
          finalData.videoUrl = videoUrl;
          console.log('Video uploaded successfully');
        } catch (err: any) {
          console.error('Video upload error:', err);
          alert(`Error al subir video: ${err.message}\n\nVerifica:\n- El tamaño (máximo 500MB)\n- La conexión a internet\n- El formato (MP4 recomendado)`);
          setLoading(false);
          return;
        }
      }

      if (selectedPrizeFiles.length > 0) {
        try {
          const uploadedPrizeImages = await Promise.all(
            selectedPrizeFiles.map(async (file, idx) => {
              const url = await uploadFile(file);
              return {
                url,
                alt: newPrizePreviews[idx]?.alt || `Premio ${idx + 1}`,
              };
            })
          );
          finalData.prizeImages = [...finalData.prizeImages, ...uploadedPrizeImages];
        } catch (err: any) {
          alert(`Error al subir imágenes del slider: ${err.message}`);
          setLoading(false);
          return;
        }
      }

      const url = rifaId ? `/api/admin/rifas/${rifaId}` : '/api/admin/rifas';
      const method = rifaId ? 'PUT' : 'POST';

      // Convertimos los campos a sus tipos correctos para la base de datos
      const payload = {
        ...finalData,
        totalNumbers: finalData.raffleMode === 'AMPHORA' ? 0 : parseInt(finalData.totalNumbers, 10),
        pricePerNumber: parseFloat(finalData.pricePerNumber),
      };

      console.log('Saving rifa...', payload);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log('Rifa saved successfully');
        router.push('/admin/rifas');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(
          `Error al guardar: ${errData.error || 'Verifica los campos obligatorios'}${
            errData.detail ? `\n\nDetalle: ${errData.detail}` : ''
          }`
        );
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Error de conexión con el servidor'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('Imagen muy grande. Máximo 10MB');
        return;
      }
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        alert('Video muy grande. Máximo 500MB');
        return;
      }
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handlePrizeImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter((file) => file.size <= maxSize);
    if (validFiles.length !== files.length) {
      alert('Una o más imágenes superan 10MB y no fueron agregadas.');
    }

    const previews = validFiles.map((file, idx) => ({
      url: URL.createObjectURL(file),
      alt: `Premio ${newPrizePreviews.length + idx + 1}`,
    }));

    setSelectedPrizeFiles((prev) => [...prev, ...validFiles]);
    setNewPrizePreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeExistingPrizeImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      prizeImages: prev.prizeImages.filter((_, i) => i !== index),
    }));
  };

  const removeNewPrizeImage = (index: number) => {
    setSelectedPrizeFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPrizePreviews((prev) => prev.filter((_, i) => i !== index));
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
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Modalidad del sorteo</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setData({ ...data, raffleMode: 'NUMBERS' })}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    data.raffleMode === 'NUMBERS'
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                  }`}
                >
                  <p className="text-sm font-bold">Escoger números</p>
                  <p className="mt-1 text-xs text-gray-500">El cliente selecciona sus números favoritos.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, raffleMode: 'AMPHORA' })}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    data.raffleMode === 'AMPHORA'
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                  }`}
                >
                  <p className="text-sm font-bold">Ánfora por tickets</p>
                  <p className="mt-1 text-xs text-gray-500">El cliente compra cantidad; su nombre entra esa cantidad de veces.</p>
                </button>
              </div>
            </div>
            {data.raffleMode === 'NUMBERS' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Números
              </label>
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
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {data.raffleMode === 'AMPHORA' ? 'Precio por ticket (S/)' : 'Precio por Número (S/)'}
              </label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen (requerida)</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imágenes del Slider (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePrizeImagesChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Puedes subir varias imágenes para el banner slider. Se mostrarán en orden.
            </p>

            {(data.prizeImages.length > 0 || newPrizePreviews.length > 0) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {data.prizeImages.map((img, index) => (
                  <div key={`saved-${index}`} className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPrizeImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                {newPrizePreviews.map((img, index) => (
                  <div key={`new-${index}`} className="relative rounded-xl overflow-hidden border border-purple-200">
                    <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewPrizeImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
                    >
                      Quitar
                    </button>
                    <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded">
                      Nueva
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Video (requerido)</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {videoPreview && (
              <div className="mt-3">
                <video src={videoPreview} controls className="w-full h-auto max-h-48 rounded-xl border-2 border-gray-200" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Premios (requerido)</label>
            <textarea
              rows={3}
              value={data.prizes}
              onChange={(e) => setData({ ...data, prizes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              placeholder="Describe los premios del sorteo. Ej: 1er lugar: Laptop + Resina + Moldes..."
              required
            />
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {selectedImageFile || selectedVideoFile ? 'Subiendo archivos...' : 'Guardando...'}
                </span>
              ) : rifaId ? 'Actualizar Rifa' : 'Crear Rifa'}
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
