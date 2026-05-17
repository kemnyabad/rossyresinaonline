import Head from "next/head";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Head>
        <title>Política de Privacidad | Rossy Resina</title>
        <meta
          name="description"
          content="Conoce cómo Rossy Resina recopila, usa y protege tu información personal."
        />
      </Head>

      <h1 className="text-2xl font-semibold text-gray-900">Política de Privacidad</h1>
      <p className="mt-3 text-sm text-gray-600">
        En Rossy Resina usamos tus datos únicamente para procesar pedidos, brindar soporte y
        mejorar la experiencia de compra.
      </p>

      <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-900">1. Datos que recopilamos</h2>
          <p className="mt-1">
            Nombre, correo, teléfono, dirección y datos necesarios para envío y facturación.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">2. Uso de la información</h2>
          <p className="mt-1">
            Utilizamos la información para confirmar pedidos, coordinar entregas y responder
            consultas.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">3. Seguridad</h2>
          <p className="mt-1">
            Aplicamos medidas técnicas y operativas razonables para proteger tus datos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">4. Contacto</h2>
          <p className="mt-1">
            Si deseas actualizar o eliminar tus datos, escríbenos por la página de contacto.
          </p>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/terms"
          className="rounded-md bg-amazon_blue px-4 py-2 text-sm font-semibold text-white hover:bg-amazon_yellow hover:text-black"
        >
          Ver términos
        </Link>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
