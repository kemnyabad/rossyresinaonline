import Head from "next/head";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-[70vh] px-6 py-12 bg-gradient-to-b from-gray-100 to-transparent">
      <Head>
        <title>Términos y condiciones — Rossy Resina</title>
        <meta name="description" content="Términos y condiciones de compra y uso de Rossy Resina." />
      </Head>
      <div className="max-w-screen-lg mx-auto bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-amazon_blue">Términos y condiciones</h1>
          <p className="mt-2 text-sm text-gray-600">Última actualización: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="px-6 py-6 grid gap-8">
          <section>
            <h2 className="text-xl font-semibold text-amazon_blue">Propiedad intelectual</h2>
            <ol className="mt-3 list-decimal list-inside text-gray-700 grid gap-2">
              <li>Todo el contenido, imágenes y textos de Rossy Resina pertenecen a sus respectivos autores.</li>
              <li>No está permitido copiar, distribuir o usar el material sin autorización previa.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amazon_blue">Condiciones de uso</h2>
            <ol className="mt-3 list-decimal list-inside text-gray-700 grid gap-2">
              <li>El usuario se compromete a utilizar la tienda de forma lícita y respetuosa.</li>
              <li>Nos reservamos el derecho de cancelar pedidos en casos de uso indebido o sospecha de fraude.</li>
              <li>Los precios y la disponibilidad pueden variar sin previo aviso.</li>
            </ol>
          </section>

          <section id="devolucion">
            <h2 className="text-xl font-semibold text-amazon_blue">Política de devolución</h2>
            <ol className="mt-3 list-decimal list-inside text-gray-700 grid gap-2">
              <li>Se aceptan cambios o devoluciones dentro de 7 días naturales desde la recepción del producto.</li>
              <li>Los productos deben estar en perfecto estado, sin uso y con empaque original.</li>
              <li>Los costos de envío por devolución corren a cargo del cliente salvo defecto de fábrica.</li>
            </ol>
          </section>

          <section id="envios">
            <h2 className="text-xl font-semibold text-amazon_blue">Envíos</h2>
            <ol className="mt-3 list-decimal list-inside text-gray-700 grid gap-2">
              <li>Realizamos envíos a todo el Perú. Tiempos de entrega estimados entre 2 y 7 días hábiles.</li>
              <li>Los plazos pueden variar por disponibilidad, ubicación y demanda.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amazon_blue">Métodos de pago</h2>
            <ol className="mt-3 list-decimal list-inside text-gray-700 grid gap-2">
              <li>Se aceptan pagos por tarjeta, Yape, transferencia bancaria y contra entrega en zonas habilitadas.</li>
              <li>En pagos con transferencia, el pedido se procesa al confirmar el abono.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amazon_blue">Privacidad</h2>
            <p className="mt-3 text-gray-700">Consulta nuestra <Link href="/privacy" className="text-amazon_blue hover:underline">política de privacidad</Link> para conocer cómo protegemos tus datos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amazon_blue">Contacto</h2>
            <p className="mt-3 text-gray-700">Para cualquier duda o gestión de pedidos, contáctanos por WhatsApp o a través de nuestras redes sociales.</p>
          </section>
        </div>

        <div className="px-6 py-6 border-t border-gray-200 flex items-center justify-between">
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Ir al inicio</Link>
          <Link href="/checkout" className="px-4 py-2 rounded-md bg-gray-100 text-amazon_blue hover:bg-amazon_yellow hover:text-black">Ir al checkout</Link>
        </div>
      </div>
    </div>
  );
}

