import React from "react";

const BENEFITS = [
  {
    title: "Envío rápido",
    description: "Gratis desde S/ 120. Desde S/ 10 en compras menores.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M3 7h10v8H3V7Zm10 2h3l3 3v3h-6V9Zm-7 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Pago seguro",
    description: "Yape y transferencia bancaria.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm2 2v2h12V9H6Zm0 4v2h6v-2H6Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Calidad y asesoría",
    description: "Te ayudamos a elegir la resina adecuada.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M12 3a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v8h-4v3H8v-3H4V10a2 2 0 0 1 2-2h2V7a4 4 0 0 1 4-4Zm-2 6h4V7a2 2 0 0 0-4 0v2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section className="max-w-screen-2xl mx-auto px-6 my-10">
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.8)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Beneficios
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Compra con confianza
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Envíos ágiles, pagos seguros y asesoría experta en resina.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  {benefit.icon}
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {benefit.title}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
