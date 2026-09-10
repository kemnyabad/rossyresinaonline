import Head from "next/head";
import Link from "next/link";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ShoppingBagIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    title: "Eliges tus productos",
    text: "Agrega al carrito moldes, resinas, pigmentos o accesorios.",
    icon: ShoppingBagIcon,
  },
  {
    title: "Revisamos stock",
    text: "Confirmamos disponibilidad y detalles del pedido.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Cotizamos el envío",
    text: "Calculamos el total según ciudad, agencia o dirección.",
    icon: MapPinIcon,
  },
  {
    title: "Coordinamos el pago",
    text: "Te indicamos el monto final por Yape o BCP.",
    icon: CreditCardIcon,
  },
  {
    title: "Despachamos",
    text: "Enviamos por Shalom u Olva Courier.",
    icon: PaperAirplaneIcon,
  },
  {
    title: "Recibes tu pedido",
    text: "El plazo referencial es de 2 a 3 días.",
    icon: TruckIcon,
  },
];

export default function ProcesoEnvioPage() {
  return (
    <>
      <Head>
        <title>Proceso de envío | Rossy Resina</title>
        <meta
          name="description"
          content="Conoce cómo realizamos los envíos en Rossy Resina: cotización, medios de pago y despacho por Shalom u Olva Courier."
        />
      </Head>

      <main className="bg-[#f7f7f8]">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
            <div className="grid items-end gap-6 md:grid-cols-[1fr_360px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amazon_blue">
                  Proceso de envío
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-gray-950 md:text-5xl">
                  Compra con una coordinación clara antes del despacho
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                  Primero eliges tus productos. Luego confirmamos stock, cotizamos el envío, coordinamos el pago y despachamos por Shalom u Olva Courier.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-[0_1px_3px_rgba(17,24,39,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tiempo referencial</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-semibold leading-none text-gray-950">2 a 3</span>
                  <span className="pb-1 text-base font-semibold text-gray-700">días aprox.</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Puede llegar antes o dentro del rango indicado, según ciudad y operación del courier.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.08)] md:p-7">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amazon_blue">Paso a paso</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-950">Así gestionamos tu pedido</h2>
              </div>
              <Link href="/productos" className="text-sm font-semibold text-amazon_blue hover:underline">
                Ver productos
              </Link>
            </div>

            <div className="grid gap-y-8 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const showRightArrow = index !== 2 && index !== steps.length - 1;
                const showDownArrow = index === 2;
                const reverseRow = index > 2;
                return (
                  <div key={step.title} className="relative px-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-lg border-2 border-amazon_blue/70 bg-pink-50 text-amazon_blue">
                        <Icon className="h-12 w-12" />
                        <span className="absolute -bottom-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-amazon_blue text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="mt-6 text-lg font-semibold leading-tight text-gray-950">{step.title}</h3>
                      <p className="mt-2 max-w-[230px] text-sm leading-6 text-gray-600">{step.text}</p>
                    </div>

                    {showRightArrow ? (
                      <div
                        className={`pointer-events-none absolute top-12 hidden items-center md:flex ${
                          reverseRow ? "left-[-20px]" : "right-[-20px]"
                        }`}
                      >
                        <div className={`h-1 w-12 bg-gray-200 ${reverseRow ? "order-2" : ""}`} />
                        <div
                          className={`h-0 w-0 border-y-[8px] border-y-transparent ${
                            reverseRow
                              ? "order-1 border-r-[12px] border-r-gray-200"
                              : "border-l-[12px] border-l-gray-200"
                          }`}
                        />
                      </div>
                    ) : null}

                    {showDownArrow ? (
                      <div className="pointer-events-none absolute -bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex">
                        <div className="h-8 w-1 bg-gray-200" />
                        <div className="h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-gray-200" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-12 md:grid-cols-[1fr_1fr] md:px-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_1px_3px_rgba(17,24,39,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-amazon_blue">
                <BanknotesIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Pagos autorizados</p>
                <h2 className="text-2xl font-semibold text-gray-950">Yape y BCP</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">BCP</p>
                <p className="mt-1 font-mono text-lg font-semibold text-gray-950">19397649019070</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Yape</p>
                <p className="mt-1 font-mono text-lg font-semibold text-gray-950">961770723</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Titular de las cuentas</p>
                <p className="mt-1 text-lg font-semibold text-gray-950">Rosa Maribel Abad Landacay</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_1px_3px_rgba(17,24,39,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-amazon_blue">
                <CheckCircleIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Antes del envío</p>
                <h2 className="text-2xl font-semibold text-gray-950">Qué confirmamos contigo</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                "Disponibilidad real de los productos.",
                "Monto final del pedido y costo de envío.",
                "Agencia, ciudad o dirección de entrega.",
                "Datos del despacho cuando el pedido sale.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
