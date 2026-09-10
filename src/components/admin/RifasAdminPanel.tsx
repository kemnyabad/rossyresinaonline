import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Rifa {
  id: string;
  title: string;
  description: string;
  totalNumbers: number;
  pricePerNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  soldCount: number;
  paidCount: number;
  availableCount: number;
}

interface RifaTicket {
  id: string;
  number: number;
  status: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  paymentImage?: string;
}

export default function RifasAdminPanel() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [rifaDetails, setRifaDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    totalNumbers: '',
    pricePerNumber: '',
    startDate: '',
    endDate: '',
    rules: '',
    status: 'ACTIVE',
  });
  const [filterStatus, setFilterStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rifas');
      if (!res.ok) {
        router.push('/admin/sign-in');
        return;
      }
      const data = await res.json();
      setRifas(data);
    } catch (error) {
      console.error('Error fetching rifas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRifaDetails = async (rifaId: string) => {
    try {
      const res = await fetch(`/api/admin/rifas/${rifaId}`);
      const data = await res.json();
      setRifaDetails(data);
      setSelectedRifa(data);
    } catch (error) {
      console.error('Error fetching rifa details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = selectedRifa
        ? `/api/admin/rifas/${selectedRifa.id}`
        : '/api/admin/rifas';
      const method = selectedRifa ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert('Error al procesar la rifa');
        return;
      }

      alert(selectedRifa ? 'Rifa actualizada' : 'Rifa creada');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        image: '',
        totalNumbers: '',
        pricePerNumber: '',
        startDate: '',
        endDate: '',
        rules: '',
        status: 'ACTIVE',
      });
      fetchRifas();
    } catch (error) {
      console.error('Error submitting rifa:', error);
    }
  };

  const handleDelete = async (rifaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta rifa?')) return;

    try {
      const res = await fetch(`/api/admin/rifas/${rifaId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Rifa eliminada');
        fetchRifas();
        setSelectedRifa(null);
        setRifaDetails(null);
      }
    } catch (error) {
      console.error('Error deleting rifa:', error);
    }
  };

  const handleVerifyPayment = async (
    ticketId: string,
    action: 'approve' | 'reject'
  ) => {
    if (!selectedRifa) return;

    try {
      const res = await fetch(
        `/api/admin/rifas/${selectedRifa.id}/${ticketId}/verify`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );

      if (res.ok) {
        alert(action === 'approve' ? 'Pago aprobado' : 'Pago rechazado');
        fetchRifaDetails(selectedRifa.id);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const filteredRifas = rifas.filter(
    (r) => !filterStatus || r.status === filterStatus
  );

  if (!selectedRifa) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Rifas</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setSelectedRifa(null);
                  setFormData({
                    title: '',
                    description: '',
                    image: '',
                    totalNumbers: '',
                    pricePerNumber: '',
                    startDate: '',
                    endDate: '',
                    rules: '',
                    status: 'ACTIVE',
                  });
                }
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              {showForm ? 'Cancelar' : 'Nueva Rifa'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Crear Nueva Rifa</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Título de la rifa"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cantidad de números"
                    value={formData.totalNumbers}
                    onChange={(e) =>
                      setFormData({ ...formData, totalNumbers: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio por número"
                    value={formData.pricePerNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerNumber: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    step="0.01"
                    required
                  />
                  <input
                    type="text"
                    placeholder="URL de imagen"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="datetime-local"
                    placeholder="Fecha de inicio"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="datetime-local"
                    placeholder="Fecha de fin"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <textarea
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />

                <textarea
                  placeholder="Bases y condiciones"
                  value={formData.rules}
                  onChange={(e) =>
                    setFormData({ ...formData, rules: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  Crear Rifa
                </button>
              </form>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filterStatus === ''
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filterStatus === 'ACTIVE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setFilterStatus('PAUSED')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filterStatus === 'PAUSED'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Pausadas
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filterStatus === 'COMPLETED'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Completadas
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando rifas...</p>
            </div>
          ) : filteredRifas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay rifas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRifas.map((rifa) => (
                <div
                  key={rifa.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => fetchRifaDetails(rifa.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {rifa.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        {rifa.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        rifa.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : rifa.status === 'PAUSED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rifa.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="text-lg font-bold text-gray-900">
                        S/ {parseFloat(rifa.pricePerNumber.toString()).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Disponibles</p>
                      <p className="text-lg font-bold text-green-600">
                        {rifa.availableCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendidos</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {rifa.soldCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pagados</p>
                      <p className="text-lg font-bold text-blue-600">
                        {rifa.paidCount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ver detalles de la rifa
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => {
            setSelectedRifa(null);
            setRifaDetails(null);
          }}
          className="mb-6 text-purple-600 hover:text-purple-800 font-semibold"
        >
          ← Volver
        </button>

        <h1 className="text-3xl font-bold mb-8">{rifaDetails?.title}</h1>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Números totales</p>
            <p className="text-3xl font-bold text-gray-900">
              {rifaDetails?.totalNumbers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Por pagar</p>
            <p className="text-3xl font-bold text-yellow-600">
              {rifaDetails?.tickets?.filter(
                (t: RifaTicket) => t.status === 'SOLD'
              ).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Pagados (pendiente verificación)</p>
            <p className="text-3xl font-bold text-blue-600">
              {rifaDetails?.tickets?.filter(
                (t: RifaTicket) => t.status === 'PAID'
              ).length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Tickets para verificar</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Comprobante
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {rifaDetails?.tickets
                  ?.filter((t: RifaTicket) => t.status !== 'AVAILABLE')
                  .map((ticket: RifaTicket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold">
                        #{ticket.number}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}
                        >
                          {ticket.status === 'SOLD' ? 'RESERVADO (Sin pago)' : ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{ticket.buyerName}</td>
                      <td className="px-6 py-4 text-sm">{ticket.buyerEmail}</td>
                      <td className="px-6 py-4 text-sm">{ticket.buyerPhone}</td>
                      <td className="px-6 py-4 text-sm">
                        {ticket.paymentImage && (
                          <a
                            href={ticket.paymentImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 underline"
                          >
                            Ver
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {(ticket.status === 'PAID' || ticket.status === 'SOLD') && (
                          <>
                            {ticket.status === 'PAID' && (
                              <button
                                onClick={() => handleVerifyPayment(ticket.id, 'approve')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"
                              >
                                ✓ Aprobar
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleVerifyPayment(ticket.id, 'reject')
                              }
                              className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs font-semibold hover:bg-red-200"
                            >
                              {ticket.status === 'SOLD' ? '✕ Liberar número' : '✗ Rechazar'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
