import Head from "next/head";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../type";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import FormattedPrice from "@/components/FormattedPrice";
import { resetCart } from "@/store/nextSlice";
import { useSession } from "next-auth/react";
import { FiCreditCard, FiInfo, FiShoppingCart } from "react-icons/fi";

type PaymentMethod = "YAPE" | "TRANSFER";
type ShippingCarrier = "SHALOM" | "OLVA";

const CheckoutSteps = () => {
  const steps = [
    { label: "Carro de Compras", icon: FiShoppingCart, active: false },
    { label: "Información de Envío", icon: FiInfo, active: true },
    { label: "Pago", icon: FiCreditCard, active: false },
  ];

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 md:py-10">
      <div className="grid grid-cols-3 items-start">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative flex flex-col items-center text-center">
              {index > 0 && (
                <span className="absolute right-1/2 top-8 h-px w-full bg-gray-300" aria-hidden="true" />
              )}
              <span
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white ${
                  step.active ? "bg-orange-600" : "bg-gray-400"
                }`}
              >
                <Icon />
              </span>
              <span className="mt-5 text-sm font-medium text-gray-950 md:text-base">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  const [showShippingForm, setShowShippingForm] = useState(true);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(false);
  const [shippingConfirmed, setShippingConfirmed] = useState(false);
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
    const sessionEmail = String((session?.user as any)?.email || "").trim().toLowerCase();
    if (!sessionEmail || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`rr_shipping_profile:${sessionEmail}`);
      if (!raw) return;
      const p = JSON.parse(raw);
      setName(String(p.name || (session?.user as any)?.name || ""));
      setDni(String(p.dni || ""));
      setPhone(String(p.phone || ""));
      setLocationLine(String(p.locationLine || ""));
      setShippingCarrier(String(p.shippingCarrier || "SHALOM") === "OLVA" ? "OLVA" : "SHALOM");
      setShalomAgency(String(p.shalomAgency || ""));
      setOlvaAddress(String(p.olvaAddress || ""));
      setOlvaReference(String(p.olvaReference || ""));
      setShowShippingForm(false);
      setSelectedSavedAddress(true);
      setShippingConfirmed(false);
    } catch {
      // Si el dato local esta corrupto, simplemente dejamos el formulario editable.
    }
  }, [session]);

  useEffect(() => {
    const sessionName = String((session?.user as any)?.name || "").trim();
    const sessionEmail = String((session?.user as any)?.email || "").trim().toLowerCase();
    if (!sessionName || name || typeof window === "undefined") return;
    const localProfile = sessionEmail ? window.localStorage.getItem(`rr_shipping_profile:${sessionEmail}`) : "";
    if (localProfile) return;

    let alive = true;
    fetch(`/api/orders/customer-profile?query=${encodeURIComponent(sessionName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive || !data?.found) return;
        const p = data.profile || {};
        setName(String(p.name || sessionName));
        setDni(String(p.dni || ""));
        setPhone(String(p.phone || ""));
        setLocationLine(String(p.locationLine || ""));
        setShippingCarrier(String(p.shippingCarrier || "SHALOM") === "OLVA" ? "OLVA" : "SHALOM");
        setShalomAgency(String(p.shalomAgency || ""));
        setOlvaAddress(String(p.olvaAddress || ""));
        setOlvaReference(String(p.olvaReference || ""));
        setShowShippingForm(false);
        setSelectedSavedAddress(true);
        setShippingConfirmed(false);
        if (sessionEmail) {
          window.localStorage.setItem(`rr_shipping_profile:${sessionEmail}`, JSON.stringify(p));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [session, name]);

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

  const isShippingReviewStep = !showShippingForm && !shippingConfirmed && !!name && !!phone && !!locationLine;

  const saveLocalShippingProfile = () => {
    const sessionEmail = String((session?.user as any)?.email || "").trim().toLowerCase();
    if (!sessionEmail || typeof window === "undefined") return;
    window.localStorage.setItem(
      `rr_shipping_profile:${sessionEmail}`,
      JSON.stringify({
        dni,
        name,
        phone,
        locationLine,
        shippingCarrier,
        shalomAgency,
        olvaAddress,
        olvaReference,
      })
    );
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
      saveLocalShippingProfile();
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
      <CheckoutSteps />
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
        <div className={isShippingReviewStep ? "mx-auto max-w-5xl" : "grid md:grid-cols-3 gap-6"}>
          <section className={isShippingReviewStep ? "bg-white p-0" : "md:col-span-2 bg-white rounded-lg p-6 shadow"}>
            <div className="mb-6">
              <p className="text-lg text-gray-950">Documento de venta</p>
              <div className="mt-4 flex gap-8 text-base">
                <label className="flex items-center gap-2">
                  <input type="radio" name="saleDoc" defaultChecked className="accent-orange-600" />
                  Boleta
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="saleDoc" className="accent-orange-600" />
                  Factura
                </label>
              </div>
            </div>

            <div className="rounded-md border border-gray-300 p-6 md:p-10">
              <h2 className="text-2xl font-black text-gray-950">Dirección de envío</h2>
              <p className="mt-1 text-lg text-gray-800">Recibe tu pedido en cualquier dirección del país.</p>

              {!showShippingForm && name && phone && locationLine ? (
                <>
                  <div className="mt-8 text-lg text-gray-950">
                    <p>¿Se encuentra la dirección que quieres utilizar desplegada a continuación?</p>
                    <p>
                      Si es así, haz click en el botón <span className="font-black">&quot;ENVIAR AQUÍ&quot;</span>.
                    </p>
                    <p>
                      O también puedes{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setShowShippingForm(true);
                          setSelectedSavedAddress(false);
                        }}
                        className="text-orange-600 hover:underline"
                      >
                        Ingresar una nueva dirección.
                      </button>
                    </p>
                  </div>

                  <div className={`mt-8 rounded-md border p-4 ${selectedSavedAddress ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"}`}>
                    <p className="text-lg font-black text-gray-950">{name}</p>
                    <p className="text-lg text-gray-950">
                      {shippingCarrier === "OLVA" ? olvaAddress : `Agencia Shalom: ${shalomAgency}`}
                    </p>
                    <p className="text-lg text-gray-950">{locationLine}</p>
                    {shippingCarrier === "OLVA" && olvaReference && (
                      <p className="text-lg text-gray-950">Referencia: {olvaReference}</p>
                    )}
                    <p className="text-lg text-gray-950">Teléfono o WhatsApp: {phone}</p>
                    <div className="mt-3 border-t border-gray-300 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSavedAddress(true);
                          setShippingConfirmed(true);
                        }}
                        className="mr-2 rounded bg-orange-600 px-5 py-2 text-sm font-bold text-white hover:bg-orange-700"
                      >
                        ENVIAR AQUÍ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sessionEmail = String((session?.user as any)?.email || "").trim().toLowerCase();
                          if (sessionEmail && typeof window !== "undefined") {
                            window.localStorage.removeItem(`rr_shipping_profile:${sessionEmail}`);
                          }
                          setName("");
                          setDni("");
                          setPhone("");
                          setLocationLine("");
                          setShalomAgency("");
                          setOlvaAddress("");
                          setOlvaReference("");
                          setShowShippingForm(true);
                          setSelectedSavedAddress(false);
                          setShippingConfirmed(false);
                        }}
                        className="mr-2 rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-950 hover:bg-gray-50"
                      >
                        Borrar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowShippingForm(true);
                          setShippingConfirmed(false);
                        }}
                        className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-950 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

            {showShippingForm && (
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
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
                <label className="text-sm text-gray-600">Teléfono o WhatsApp</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 961770723"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
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
            )}

            {!showShippingForm && shippingConfirmed && (
              <div className="mt-8 grid gap-4 border-t border-gray-200 pt-6">
                <div>
                  <label className="text-sm text-gray-600">Método de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value === "TRANSFER" ? "TRANSFER" : "YAPE")}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="YAPE">Yape</option>
                    <option value="TRANSFER">Transferencia</option>
                  </select>
                </div>

                <div>
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
                  <div>
                    <img src={paymentPreview} alt="Comprobante" className="max-h-64 rounded border border-gray-200" />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Notas del pedido</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 h-24" />
                </div>

                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span>Acepto que este pedido sera confirmado manualmente por el equipo de Rossy Resina.</span>
                </label>
              </div>
            )}
            </div>
          </section>

          {!isShippingReviewStep && (
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
          )}
        </div>
      )}
    </div>
  );
}
