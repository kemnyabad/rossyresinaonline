import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const data = [
  {
    q: "Cules son los medios de pago?",
    a: "Aceptamos Yape y transferencia bancaria. Al finalizar tu compra en Checkout podrs elegir el mtodo y confirmar por WhatsApp."
  },
  {
    q: "Hacen env?os?",
    a: "S, enviamos a todo el Per. El env?o es gratis en pedidos desde S/ 120. En compras menores el costo de env?o es desde S/ 10."
  },
  {
    q: "Cmo elijo la resina adecuada?",
    a: "Para joyera y piezas pequeas recomendamos resina epoxi 1:1. Para recubrimientos y mayor dureza, epoxi estndar con catalizador."
  },
  {
    q: "Qu incluye un kit de resina?",
    a: "Incluye resina, catalizador, instrucciones bsicas, y puede agregar pigmentos o moldes segn tu eleccin."
  },
  {
    q: "Aceptan devoluciones?",
    a: "Aceptamos devoluciones dentro de 7 das si el producto est sellado y en perfectas condiciones. Contctanos para coordinar."
  },
  {
    q: "Puedo recoger en tienda?",
    a: "S, podemos coordinar recojo en Lima previa confirmacin por WhatsApp."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Rossy Resina  -  Preguntas frecuentes</title>
      </Head>

      <h1 className="text-2xl font-semibold mb-4 text-amazon_blue">Preguntas frecuentes</h1>
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {data.map((item, idx) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full text-left px-4 py-3 flex items-center justify-between"
            >
              <span className="font-medium">{item.q}</span>
              <span className="text-gray-500">{open === idx ? "" : "+"}</span>
            </button>
            {open === idx && (
              <div className="px-4 pb-4 text-gray-700">{item.a}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-700">
        <p>No encontraste tu respuesta? Escrbenos por <Link href="/contact" className="text-amazon_blue hover:underline">Contacto</Link> o confirma por WhatsApp desde el Checkout.</p>
      </div>
    </div>
  );
}
