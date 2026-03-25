import Link from "next/link";

export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div className="mx-auto flex min-h-screen items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-5xl font-black text-red-600">{statusCode || 500}</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Ocurrió un error</h2>
        <p className="mt-3 text-sm text-gray-600">
          Estamos trabajando para solucionarlo. Puedes intentar recargar la página o volver al inicio.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Recargar
          </button>
          <Link href="/" className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: any; err?: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 500;
  return { statusCode };
};