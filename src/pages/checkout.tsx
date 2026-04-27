import Head from "next/head";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../type";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import FormattedPrice from "@/components/FormattedPrice";
import { resetCart } from "@/store/nextSlice";
import { useSession } from "next-auth/react";

type PaymentMethod = "YAPE" | "TRANSFER";
type ShippingCarrier = "SHALOM" | "OLVA";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { productData, userInfo } = useSelector((state: StateProps) => state.next);
  const autofillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutofillKey = useRef("");

  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [locationLine, setLocationLine] = useState("");

  const [shippingCarrier, setShippingCarrier] = useState<ShippingCarrier>("SHALOM");
  const [shalomAgency, setShalomAgency] = useState("");
  const [olvaAddress, setOlvaAddress] = useState("");
  const [olvaReference, setOlvaReference] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("YAPE");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const yapeNumber = process.env.NEXT_PUBLIC_YAPE_NUMBER || "961770723";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Banco";
  const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "";

  useEffect(() => {
    if (userInfo) {
      // @ts-ignore
      setName(userInfo.name || "");
      // @ts-ignore
      setPhone(userInfo.phone || "");
    }
  }, [userInfo]);

  useEffect(() => {
    return () => {
      if (autofillTimer.current) clearTimeout(autofillTimer.current);
    };
  }, []);

  const totals = useMemo(() => {
    const subtotal = productData.reduce((sum: number, p: StoreProduct) => sum + p.price * p.quantity, 0);
    const total = subtotal;
    return { subtotal, total };
  }, [productData]);

  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };

  const handlePaymentFile = (file?: File | null) => {
    if (!file) {
      setPaymentFile(null);
      setPaymentPreview("");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("El comprobante no debe superar 10MB.");
      return;
    }
    setErrorMsg("");
    setPaymentFile(file);
    const reader = new FileReader();
    reader.onload = () => setPaymentPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const autoCompleteCustomer = (value: string, source: "name" | "dni") => {
    const query = String(value || "").trim();
    if (source === "dni" && query.replace(/\D/g, "").length < 8) return;
    if (source === "name" && query.length < 6) return;

    const key = `${source}:${query.toLowerCase()}`;
    if (lastAutofillKey.current === key) return;
    if (autofillTimer.current) clearTimeout(autofillTimer.current);

    autofillTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/customer-profile?query=${encodeURIComponent(query)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.found) return;

        const p = data.profile || {};
        setName(String(p.name || ""));
        setDni(String(p.dni || ""));
        setPhone(String(p.phone || ""));
        setLocationLine(String(p.locationLine || ""));
        setShippingCarrier(String(p.shippingCarrier || "SHALOM") === "OLVA" ? "OLVA" : "SHALOM");
        setShalomAgency(String(p.shalomAgency || ""));
        setOlvaAddress(String(p.olvaAddress || ""));
        setOlvaReference(String(p.olvaReference || ""));
        lastAutofillKey.current = key;
      } catch {
        // Silencioso para no interrumpir al cliente nuevo.
      }
    }, 350);
  };

  const canSubmit = () => {
    if (!name.trim()) return false;
    if (!dni.trim()) return false;
    if (!phone.trim()) return false;
    if (!locationLine.trim()) return false;
    if (!paymentFile || !paymentPreview) return false;
    if (!acceptTerms) return false;
    if (shippingCarrier === "SHALOM" && !shalomAgency.trim()) return false;
    if (shippingCarrier === "OLVA" && (!olvaAddress.trim() || !olvaReference.trim())) return false;
    return true;
  };

  const handleConfirmOrder = async () => {
    setErrorMsg("");
    if (!canSubmit()) {
      setErrorMsg("Completa los datos requeridos, adjunta comprobante y acepta las condiciones.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name,
            dni,
            phone,
            email: String((session?.user as any)?.email || ""),
            locationLine,
            notes,
          },
          shippingCarrier,
          shalomAgency,
          olvaAddress,
          olvaReference,
          paymentMethod,
          paymentImage: paymentPreview,
          items: productData,
          total: totals.total,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo confirmar el pedido.");
      }

      const saved = await res.json();
      setSuccessId(saved?.orderCode || saved?.id || "");
      dispatch(resetCart());
    } catch (e: any) {
      setErrorMsg(e?.message || "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="max-w-screen-lg mx-auto px-6 py-10">
        <Head>
          <title>Pedido confirmado - Rossy Resina</title>
        </Head>
        <div className="bg-white rounded-lg p-8 shadow border border-emerald-100">
          <h1 className="text-2xl font-semibold text-emerald-700">Pedido recibido</h1>
          <p className="mt-2 text-gray-700">
            Tu pedido fue registrado correctamente. Codigo: <strong>{successId}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            En breve confirmaremos tu compra y env?o.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="px-4 py-2 rounded bg-amazon_blue text-white text-sm font-semibold hover:brightness-95">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Rossy Resina - Checkout</title>
      </Head>
      {productData.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-lg">Tu carrito esta vacio.</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-amazon_blue px-5 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Datos de env?o</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nombre completo</label>
                <input
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setName(v);
                    autoCompleteCustomer(v, "name");
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">DNI</label>
                <input
                  value={dni}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setDni(v);
                    autoCompleteCustomer(v, "dni");
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Telefono</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Departamento - Provincia - Distrito (en un solo campo)</label>
                <input
                  value={locationLine}
                  onChange={(e) => setLocationLine(e.target.value)}
                  placeholder="Ej: Lima - Lima - San Juan de Lurigancho"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Agencia de env?o</label>
                <select
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value === "OLVA" ? "OLVA" : "SHALOM")}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="SHALOM">Shalom</option>
                  <option value="OLVA">Olva Courier</option>
                </select>
              </div>

              {shippingCarrier === "SHALOM" ? (
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Agencia Shalom donde recogera</label>
                  <input
                    value={shalomAgency}
                    onChange={(e) => setShalomAgency(e.target.value)}
                    placeholder="Ej: Agencia Shalom Los Olivos"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-600">Direccion donde Olva entregara</label>
                    <input
                      value={olvaAddress}
                      onChange={(e) => setOlvaAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-600">Referencia del domicilio</label>
                    <textarea
                      value={olvaReference}
                      onChange={(e) => setOlvaReference(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">M?todo de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value === "TRANSFER" ? "TRANSFER" : "YAPE")}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="YAPE">Yape</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Comprobante de pago</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePaymentFile(e.target.files?.[0])}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {paymentFile && <p className="text-xs text-gray-500 mt-1">Archivo: {paymentFile.name}</p>}
              </div>
              {paymentPreview && (
                <div className="sm:col-span-2">
                  <img src={paymentPreview} alt="Comprobante" className="max-h-64 rounded border border-gray-200" />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Notas del pedido</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 h-24" />
              </div>

              <label className="sm:col-span-2 flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>Acepto que este pedido sera confirmado manualmente por el equipo de Rossy Resina.</span>
              </label>
            </div>
          </section>

          <aside className="md:col-span-1 md:sticky md:top-24 h-fit space-y-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
              <ul className="divide-y divide-gray-200">
                {productData.map((p: StoreProduct) => (
                  <li key={p._id} className="py-3 flex items-center gap-3">
                    <img src={normImg(p.image)} alt={p.title} className="rounded object-cover w-[60px] h-[60px]" loading="lazy" />
                    <div className="flex-1">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-gray-600">Cantidad: {p.quantity}</p>
                    </div>
                    <div className="font-semibold"><FormattedPrice amount={p.price * p.quantity} /></div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span><FormattedPrice amount={totals.subtotal} /></span></div>
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span><FormattedPrice amount={totals.total} /></span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-sm text-gray-700">
                <p className="font-semibold">Datos de pago</p>
                <p className="mt-2">Yape: <span className="font-semibold">{yapeNumber}</span></p>
                <p className="mt-1">Transferencia: <span className="font-semibold">{bankName}</span> {accountNumber ? `- ${accountNumber}` : ""}</p>
                <p className="text-xs text-gray-600 mt-1">Debes adjuntar comprobante para confirmar el pedido.</p>
              </div>
              {errorMsg && <div className="mt-3 text-xs text-red-600">{errorMsg}</div>}
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={submitting}
                className="mt-4 w-full h-11 text-sm font-semibold bg-orange-500 text-white rounded-full hover:brightness-105 disabled:opacity-60"
              >
                {submitting ? "Enviando..." : "Confirmar pedido"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
