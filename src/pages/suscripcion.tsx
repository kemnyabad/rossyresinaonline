import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function SuscripcionPage() {
  const [subMethod, setSubMethod] = useState<"yape" | "transferencia">("yape");
  const [subStatus, setSubStatus] = useState<"idle" | "pending">("idle");
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const subscriptionPrice = 20;
  const contactPhoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || "900000000";
  const whatsapp = useMemo(() => contactPhoneRaw.replace(/[^0-9]/g, ""), [contactPhoneRaw]);
  const yapeNumber = process.env.NEXT_PUBLIC_YAPE_NUMBER || contactPhoneRaw;
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Transferencia bancaria";
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "Cuenta por confirmar";
  const bankCci = process.env.NEXT_PUBLIC_BANK_CCI || "CCI por confirmar";

  const whatsappHref = useMemo(() => {
    const methodLabel = subMethod === "yape" ? "Yape" : "Transferencia";
    const text = `Hola, quiero suscribirme a Capacitaciones (S/ ${subscriptionPrice} mensual).\n\nNombre: ${subName || "-"}\nCorreo: ${subEmail || "-"}\nTelefono: ${subPhone || "-"}\nMetodo: ${methodLabel}\n\nAdjunto mi comprobante.`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  }, [whatsapp, subMethod, subName, subEmail, subPhone, subscriptionPrice]);

  const handleWhatsappPay = () => {
    setSubStatus("pending");
    if (typeof window !== "undefined") {
      window.location.href = whatsappHref;
    }
  };

  return (
    <>
      <Head>
        <title>Rossy Resina Studio | Suscripcion</title>
        <meta
          name="description"
          content="Suscripcion mensual para capacitaciones de Rossy Resina. Pago por Yape o transferencia."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Space+Grotesk:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fce7f3,_#f8fafc_50%,_#e2e8f0_100%)] text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-screen-2xl px-5 py-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white border border-pink-200 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Rossy Resina" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-pink-600" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Rossy Resina
                </p>
                <p className="text-xs text-gray-500">Studio de capacitaciones</p>
              </div>
            </div>
            <div className="flex-1 min-w-[220px]" />
            <div className="flex items-center gap-3 text-sm">
              <Link href="/capacitaciones" className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50">
                Volver
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-screen-2xl px-5 py-10">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-pink-600">Suscripcion mensual</p>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2" style={{ fontFamily: '"Oswald", sans-serif' }}>
              Potencia tu aprendizaje
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Acceso completo a capacitaciones, novedades y soporte por WhatsApp.
            </p>
          </div>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6 items-start">
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white p-6">
                <p className="text-sm uppercase tracking-[0.3em] opacity-90">Plan unico</p>
                <h2 className="text-2xl font-semibold mt-2">Capacitaciones Rossy Resina</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold">S/ {subscriptionPrice}</span>
                  <span className="text-sm opacity-90">/ mes</span>
                </div>
                <p className="text-xs opacity-90 mt-2">Renovacion mensual automatica por confirmacion.</p>
              </div>
              <div className="p-6">
                <ul className="text-sm text-gray-700 grid gap-3">
                  {[
                    "Acceso a todas las capacitaciones actuales",
                    "Nuevos videos cada mes",
                    "Soporte directo por WhatsApp",
                    "Materiales y recomendaciones de compra",
                  ].map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-pink-500" />
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="px-3 py-1 rounded-full border border-gray-200">Acceso inmediato</span>
                  <span className="px-3 py-1 rounded-full border border-gray-200">Sin permanencia</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Completa tu suscripcion</h3>
              <p className="text-sm text-gray-600 mt-1">
                Selecciona tu metodo de pago y confirma por WhatsApp.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs text-gray-600">Nombre</label>
                  <input
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs text-gray-600">Correo</label>
                  <input
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs text-gray-600">Telefono</label>
                  <input
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="900000000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Metodo de pago</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setSubMethod("yape")}
                    className={`text-left rounded-xl border px-4 py-3 ${subMethod === "yape" ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white"}`}
                  >
                    <p className="text-sm font-semibold">Yape</p>
                    <p className="text-xs text-gray-500 mt-1">Paga y confirma por WhatsApp.</p>
                  </button>
                  <button
                    onClick={() => setSubMethod("transferencia")}
                    className={`text-left rounded-xl border px-4 py-3 ${subMethod === "transferencia" ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white"}`}
                  >
                    <p className="text-sm font-semibold">Transferencia</p>
                    <p className="text-xs text-gray-500 mt-1">Deposito bancario mensual.</p>
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                <p className="font-semibold text-gray-900">Datos de pago</p>
                {subMethod === "yape" ? (
                  <div className="mt-2 text-gray-700">
                    <p>Yape a: <span className="font-semibold">{yapeNumber}</span></p>
                    <p className="text-xs text-gray-500 mt-1">Luego envia tu comprobante por WhatsApp.</p>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-700">
                    <p>{bankName}</p>
                    <p className="text-xs mt-1">Cuenta: {bankAccount}</p>
                    <p className="text-xs">CCI: {bankCci}</p>
                  </div>
                )}
                <button
                  onClick={handleWhatsappPay}
                  className="mt-4 w-full rounded-full bg-pink-600 text-white text-sm font-semibold py-2"
                >
                  Ir a WhatsApp para pagar
                </button>
                {subStatus === "pending" && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Pago en verificacion. Estado: esperando comprobacion.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
