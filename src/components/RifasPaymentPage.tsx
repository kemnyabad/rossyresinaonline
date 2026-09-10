import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface PaymentPageProps {
  rifaId: string;
  ticketIds: string[];
  totalPrice: number;
}

export default function PaymentPage({ rifaId, ticketIds, totalPrice }: PaymentPageProps) {
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentImage) {
      setMessage('Por favor, sube una imagen del comprobante de pago');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const base64Image = await convertToBase64(paymentImage);

      // Enviar la imagen de pago para cada ticket
      const results = await Promise.all(
        ticketIds.map((ticketId) =>
          fetch(`/api/rifas/${rifaId}/${ticketId}/payment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentImage: base64Image,
            }),
          })
        )
      );

      const allSuccess = results.every((r) => r.ok);
      if (!allSuccess) {
        throw new Error('Error al procesar algunos pagos');
      }

      setMessage('✅ Pago registrado correctamente. El administrador verificará tu comprobante en las próximas 24 horas.');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error uploading payment:', error);
      setMessage('❌ Error al registrar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-900">Confirmación de Pago</h1>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Método de pago: Yape</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Por favor, realiza la transferencia por Yape a nuestro número y luego sube la captura de pantalla del comprobante.
          </p>
          <div className="bg-yellow-100 p-3 rounded text-center">
            <p className="text-xs text-gray-600">Contacta con nosotros para obtener nuestro número de Yape</p>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Monto a pagar:</p>
          <p className="text-3xl font-bold text-purple-600">S/ {totalPrice.toFixed(2)}</p>
          <p className="text-xs text-gray-600 mt-2">{ticketIds.length} número(s)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sube la captura de pago *
            </label>
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                 onClick={() => document.getElementById('imageInput')?.click()}>
              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-green-600 font-semibold">✓ Imagen seleccionada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl">📸</p>
                  <p className="text-gray-900 font-semibold">Haz clic para seleccionar imagen</p>
                  <p className="text-sm text-gray-500">o arrastra la imagen aquí</p>
                </div>
              )}
            </div>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-semibold ${
              message.includes('✅')
                ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
                : 'bg-red-50 text-red-800 border-l-4 border-red-500'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!paymentImage || loading}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Procesando...' : 'Confirmar pago'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Luego de confirmar tu pago, el administrador verificará tu comprobante. 
          Recibirás una confirmación por email.
        </p>
      </div>
    </div>
  );
}
