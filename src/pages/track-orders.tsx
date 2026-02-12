import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type TrackingStep = {
  key: string;
  title: string;
  desc: string;
};

export default function TrackOrdersPage() {
  const { data: session } = useSession();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (session?.user?.email && !email) setEmail(session.user.email as string);
  }, [session, email]);

  const steps: TrackingStep[] = useMemo(
    () => [
      { key: "received", title: "Pedido recibido", desc: "Tu pedido ha sido registrado correctamente." },
      { key: "processing", title: "Procesando", desc: "Estamos preparando tus productos." },
      { key: "shipped", title: "Enviado", desc: "Tu pedido ha salido del almacén." },
      { key: "delivered", title: "Entregado", desc: "Tu pedido ha sido entregado." },
    ],
    []
  );

  const currentIndex = useMemo(() => {
    if (!submitted) return -1;
    const seed = Math.max(1, orderId.trim().length);
    return Math.min(steps.length - 1, (seed % steps.length));
  }, [submitted, orderId, steps.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[70vh] px-6 py-12 bg-gradient-to-b from-gray-100 to-transparent">
      <Head>
        <title>Seguimiento de pedidos — Rossy Resina</title>
        <meta name="description" content="Consulta el estado de tu pedido ingresando tu número y correo." />
      </Head>
      <div className="max-w-screen-lg mx-auto bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-amazon_blue">Seguimiento de pedidos</h1>
          <p className="mt-2 text-sm text-gray-600">Ingresa tu número de pedido y correo electrónico para ver el estado.</p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="orderId" className="text-sm font-medium text-gray-700">Número de pedido</label>
              <input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="h-10 rounded-md border border-gray-300 px-3 outline-none focus:border-amazon_yellow"
                placeholder="RR-000123"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border border-gray-300 px-3 outline-none focus:border-amazon_yellow"
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Buscar pedido</button>
            </div>
          </form>
        </div>

        {submitted && (
          <div className="px-6 pb-6">
            <div className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedido</p>
                  <p className="text-base font-semibold text-amazon_blue">{orderId || "N/A"}</p>
                </div>
                <div className="text-sm text-gray-600">{email || ""}</div>
              </div>
              <div className="mt-4">
                <div className="grid gap-4">
                  {steps.map((s, idx) => (
                    <div key={s.key} className="flex items-start gap-3">
                      <span className={`mt-1 w-3 h-3 rounded-full ${idx <= currentIndex ? "bg-amazon_blue" : "bg-gray-300"}`}></span>
                      <div>
                        <p className="text-sm font-semibold text-amazon_blue">{s.title}</p>
                        <p className="text-sm text-gray-600">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Si no encuentras la información de tu envío, contáctanos por WhatsApp para asistencia.</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-6 border-t border-gray-200 flex items-center justify-between">
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Ir al inicio</Link>
          <Link href="/checkout" className="px-4 py-2 rounded-md bg-gray-100 text-amazon_blue hover:text-brand_teal">Ir al checkout</Link>
        </div>
      </div>
    </div>
  );
}
