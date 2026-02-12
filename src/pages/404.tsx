import Head from "next/head";
import Link from "next/link";

export default function NotFoundPage() {
  const categories = [
    { href: "/categoria/resina", label: "Resina" },
    { href: "/categoria/moldes-de-silicona", label: "Moldes de silicona" },
    { href: "/categoria/pigmentos", label: "Pigmentos" },
    { href: "/categoria/accesorios", label: "Accesorios" },
  ];
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-gray-100">
      <Head>
        <title>Rossy Resina — Página no encontrada</title>
      </Head>
      <div className="max-w-screen-md w-full bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <div className="mx-auto w-24 h-24 rounded-full bg-amazon_blue text-white flex items-center justify-center text-3xl font-bold">
          404
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-amazon_blue">Página no encontrada</h1>
        <p className="mt-2 text-gray-600">Lo sentimos, la página que buscaste no está disponible.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Ir al inicio</Link>
          <Link href="/categoria/resina" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Ver catálogo</Link>
          <a href="https://wa.me/51966357648" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">WhatsApp</a>
          {categories.map((c) => (
            <Link key={c.href} href={c.href} className="px-4 py-2 rounded-md bg-gray-100 text-amazon_blue hover:bg-amazon_yellow hover:text-black">
              {c.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-2">
          <p className="text-sm text-gray-500">También puedes explorar nuestras categorías destacadas.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/categoria/resina" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Resina epoxi y UV</Link>
            <Link href="/categoria/moldes-de-silicona" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Moldes de silicona</Link>
            <Link href="/categoria/pigmentos" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Pigmentos y glitter</Link>
            <Link href="/categoria/accesorios" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Accesorios</Link>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/faq" className="rounded-lg p-4 bg-gray-100 border border-gray-200 hover:bg-gray-200">Preguntas frecuentes</Link>
            <Link href="/contact" className="rounded-lg p-4 bg-gray-100 border border-gray-200 hover:bg-gray-200">Contacto</Link>
            <Link href="/blog" className="rounded-lg p-4 bg-gray-100 border border-gray-200 hover:bg-gray-200">Blog</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
