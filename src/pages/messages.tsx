import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
      <div className="text-sm text-gray-500 mb-4">Inicio / Centro de mensajes</div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-2">Centro de mensajes</h1>
        <p className="text-sm text-gray-600">
          Pronto podras ver tus mensajes y notificaciones aqui.
        </p>
        <div className="mt-4">
          <Link href="/account" className="text-sm text-amazon_blue hover:underline">
            Volver a Mi Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
