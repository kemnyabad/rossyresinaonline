import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import type { GetServerSideProps } from 'next';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RifaStatus {
  id: string;
  title: string;
  status: string;
  expectedTotal: number;
  actualTotal: number;
  available: number;
  pending: number;
  sold: number;
  paid: number;
  missing: number;
}

interface Ticket {
  rifaId: string;
  rifaTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  paymentImage: string;
  status: string;
  createdAt: string;
  numbers: number[];
}

export default function AdminRifas() {
  const [rifas, setRifas] = useState<RifaStatus[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    videoUrl: '',
    totalNumbers: '',
    pricePerNumber: '',
    startDate: '',
    endDate: '',
    rules: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchStatus();
    fetchTickets();
    const interval = setInterval(() => {
      fetchStatus();
      fetchTickets();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/utils?action=status');
      const data = await res.json();
      if (data.success) {
        setRifas(data.rifas);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/utils?action=tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleFixMissing = async (rifaId: string) => {
    setFixing(rifaId);
    try {
      const res = await fetch('/api/admin/utils?action=fix-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rifaId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        await fetchStatus();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('Error al reparar');
    } finally {
      setFixing(null);
    }
  };

  const handleConfirmPayment = async (ticket: Ticket) => {
    const key = `${ticket.rifaId}-${ticket.buyerName}`;
    setConfirmingId(key);
    try {
      // Cambiar todos los números a PAID
      for (const number of ticket.numbers) {
        const res = await fetch('/api/admin/utils?action=set-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rifaId: ticket.rifaId,
            number: number,
            newStatus: 'PAID',
          }),
        });
        if (!res.ok) {
          throw new Error(`Error al cambiar número ${number}`);
        }
      }
      alert(`✅ Pago confirmado para ${ticket.buyerName}\nNúmeros: ${ticket.numbers.join(', ')}`);
      await fetchStatus();
      await fetchTickets();
    } catch (error) {
      alert('Error al confirmar pago');
    } finally {
      setConfirmingId(null);
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

  const handleSubmitRifa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al crear la rifa');

      alert('✅ Rifa creada correctamente');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        image: '',
        videoUrl: '',
        totalNumbers: '',
        pricePerNumber: '',
        startDate: '',
        endDate: '',
        rules: '',
        status: 'ACTIVE',
      });
      await fetchStatus();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnulTicket = async (ticket: Ticket) => {
    if (!confirm(`¿Estás seguro de anular la reserva de ${ticket.buyerName}?\nLos números ${ticket.numbers.join(', ')} volverán a estar disponibles.`)) return;
    
    const key = `${ticket.rifaId}-${ticket.buyerName}`;
    setConfirmingId(key);
    try {
      for (const number of ticket.numbers) {
        const res = await fetch('/api/admin/utils?action=set-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rifaId: ticket.rifaId,
            number: number,
            newStatus: 'AVAILABLE',
          }),
        });
        if (!res.ok) throw new Error('Error resetting number');
      }
      alert(`✅ Reserva anulada para ${ticket.buyerName}.`);
      await fetchStatus();
      await fetchTickets();
    } catch (error) {
      alert('Error al anular reserva');
    } finally {
      setConfirmingId(null);
    }
  };

  const deleteRifa = async (id: string) => {
    if (!confirm('¿Eliminar esta rifa y todos sus números?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/rifas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRifas(prev => prev.filter(r => r.id !== id));
        alert('✅ Rifa eliminada correctamente');
      } else {
        alert('Error eliminando');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setDeleting(null);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.numbers.some(n => n.toString().includes(searchTerm)) ||
    t.buyerPhone.includes(searchTerm)
  );

  const pendingTickets = filteredTickets.filter(t => t.status === 'PENDING');
  const paidTickets = filteredTickets.filter(t => t.status === 'PAID');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Gestión de Rifas</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              showForm ? 'bg-gray-200 text-gray-700' : 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
            }`}
          >
            {showForm ? 'Cancelar' : '＋ Nueva Rifa'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Formulario de Nueva Rifa */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-purple-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Sorteo</h2>
                <form onSubmit={handleSubmitRifa} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Título del Sorteo</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej: Gran Rifa de Verano"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Cantidad de Números</label>
                      <input
                        required
                        type="number"
                        placeholder="Ej: 100 o 300"
                        value={formData.totalNumbers}
                        onChange={(e) => setFormData({ ...formData, totalNumbers: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Precio por Número (S/)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        value={formData.pricePerNumber}
                        onChange={(e) => setFormData({ ...formData, pricePerNumber: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Imagen (URL)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Video del Banner (Opcional)</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadFile(file);
                            setFormData({ ...formData, videoUrl: url });
                          }
                        }}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Descripción / Premios</label>
                    <textarea
                      rows={3}
                      placeholder="Describe los premios y detalles..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Fecha Inicio</label>
                      <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Fecha Sorteo</label>
                      <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md">
                    🚀 Lanzar Rifa
                  </button>
                </form>
              </div>
            )}

            {/* Resumen de Rifas */}
            <div className="space-y-6">
              {rifas.map((rifa) => (
                <div key={rifa.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-purple-700 mb-4">{rifa.title}</h2>
                      <div className="space-y-2">
                        <p className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span className="font-semibold bg-green-100 text-green-700 px-3 py-1 rounded">
                            {rifa.status === 'ACTIVE' ? '🟢 Activa' : '⚫ Inactiva'}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Total Esperado:</span>
                          <span className="font-semibold">{rifa.expectedTotal} números</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Total Actual:</span>
                          <span className={`font-semibold ${rifa.missing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {rifa.actualTotal} números
                          </span>
                        </p>
                        {rifa.missing > 0 && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded mt-3">
                            <p className="text-red-700 font-semibold">⚠️ FALTANTES: {rifa.missing} números</p>
                            <button
                              onClick={() => handleFixMissing(rifa.id)}
                              disabled={fixing === rifa.id}
                              className="mt-2 w-full bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
                            >
                              {fixing === rifa.id ? 'Reparando...' : 'Reparar Ahora'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Conteo por Estado</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-3xl font-bold text-blue-600">{rifa.available}</p>
                          <p className="text-sm text-gray-600">Disponibles</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <p className="text-3xl font-bold text-yellow-600">{rifa.pending}</p>
                          <p className="text-sm text-gray-600">Pendientes</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <p className="text-3xl font-bold text-orange-600">{rifa.sold}</p>
                          <p className="text-sm text-gray-600">Vendidos</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-3xl font-bold text-green-600">{rifa.paid}</p>
                          <p className="text-sm text-gray-600">Pagados</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Progreso de Venta</p>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-500 via-orange-500 to-green-500 h-full transition-all"
                            style={{ width: `${((rifa.pending + rifa.sold + rifa.paid) / rifa.actualTotal) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(((rifa.pending + rifa.sold + rifa.paid) / rifa.actualTotal) * 100).toFixed(1)}% vendido
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acciones */}
                  <div className="flex items-center gap-2 pt-4 mt-6 border-t border-gray-100">
                    <Link 
                      href={`/admin/rifa/${rifa.id}`}
                      className="flex-1 text-center py-2 px-4 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 hover:border-purple-500 hover:text-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteRifa(rifa.id)}
                      disabled={deleting === rifa.id}
                      className="flex-1 text-center py-2 px-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {deleting === rifa.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Buscador de Compradores/Números */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">🔍 Buscar Comprador o Número</h2>
                <input
                  type="text"
                  placeholder="Ej: Juan Perez o el número 15..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Tabla de Comprobantes Pendientes */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-yellow-600 mb-4">⏳ Comprobantes Pendientes ({pendingTickets.length})</h2>
              
              {pendingTickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay comprobantes pendientes</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-50 border-b-2 border-yellow-200">
                        <th className="px-4 py-3 text-left">Cliente</th>
                        <th className="px-4 py-3 text-left">WhatsApp</th>
                        <th className="px-4 py-3 text-left">Números</th>
                        <th className="px-4 py-3 text-left">Comprobante</th>
                        <th className="px-4 py-3 text-left">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTickets.map((ticket, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{ticket.buyerName}</td>
                          <td className="px-4 py-3">
                            <a 
                              href={`https://wa.me/${ticket.buyerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              {ticket.buyerPhone}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded font-semibold">
                              {ticket.numbers.join(', ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {ticket.paymentImage ? (
                              <button
                                onClick={() => {
                                  // Permitimos URLs (http) y también formato de datos directo (data:)
                                  const isUrl = ticket.paymentImage.startsWith('http');
                                  const isBase64 = ticket.paymentImage.startsWith('data:');
                                  
                                  if (!isUrl && !isBase64) {
                                    return alert("Este ticket tiene un formato de referencia antiguo que no contiene la imagen real.");
                                  }

                                  setSelectedImage(ticket.paymentImage);
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                              >
                                Ver 📷
                              </button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={() => handleConfirmPayment(ticket)}
                              disabled={confirmingId === `${ticket.rifaId}-${ticket.buyerName}`}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs disabled:opacity-50"
                            >
                              {confirmingId === `${ticket.rifaId}-${ticket.buyerName}` ? 'Confirmando...' : '✅ Confirmar'}
                            </button>
                            <button
                              onClick={() => handleAnnulTicket(ticket)}
                              disabled={confirmingId === `${ticket.rifaId}-${ticket.buyerName}`}
                              className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-xs font-semibold disabled:opacity-50"
                            >
                              ❌ Anular
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tabla de Comprobantes Pagados */}
            {paidTickets.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-green-600 mb-4">✅ Pagos Confirmados ({paidTickets.length})</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-50 border-b-2 border-green-200">
                        <th className="px-4 py-3 text-left">Cliente</th>
                        <th className="px-4 py-3 text-left">WhatsApp</th>
                        <th className="px-4 py-3 text-left">Números</th>
                        <th className="px-4 py-3 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidTickets.map((ticket, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{ticket.buyerName}</td>
                          <td className="px-4 py-3">{ticket.buyerPhone}</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded font-semibold">
                              {ticket.numbers.join(', ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal para ver imagen */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex justify-between items-center p-4 border-b bg-white">
                <h3 className="font-bold text-lg">Comprobante de Pago</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-4xl font-bold text-gray-500 hover:text-gray-700 w-10 h-10 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 flex justify-center">
                <img src={selectedImage} alt="Comprobante" className="max-w-full max-h-[70vh] object-contain rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            ℹ️ <strong>Los datos se actualizan automáticamente cada 10 segundos.</strong>
            <br />
            Verifica el comprobante, hace clic en "✅ Confirmar" para aprobar el pago.
          </p>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/sign-in?callbackUrl=/admin/rifas',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
