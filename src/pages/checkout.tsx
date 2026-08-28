import Head from "next/head";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../type";
import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router";
import FormattedPrice from "@/components/FormattedPrice";
import { trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { getBundleLineTotal } from "@/lib/bundlePromo";
import { resetCart } from "@/store/nextSlice";
import { useSession } from "next-auth/react";
import { Bars3Icon, ChevronLeftIcon } from "@heroicons/react/24/outline";

type PaymentMethod = "YAPE" | "TRANSFER";
type ShippingCarrier = "SHALOM" | "OLVA";

const PAYMENT_DETAILS: Record<
  PaymentMethod,
  {
    label: string;
    numberLabel: string;
    number: string;
    holder: string;
  }
> = {
  YAPE: {
    label: "Yape",
    numberLabel: "Numero de Yape",
    number: "961770723",
    holder: "Rosa Maribel Abad Landacay",
  },
  TRANSFER: {
    label: "Transferencia",
    numberLabel: "Cuenta BCP",
    number: "19397649019070",
    holder: "Rosa Maribel Abad Landacay",
  },
};

function PaymentBrandMark({ method }: { method: PaymentMethod }) {
  if (method === "YAPE") {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#742384] text-xs font-black text-white shadow-sm">
        yape
      </span>
    );
  }

  return (
    <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-white px-2 shadow-sm ring-1 ring-gray-200">
      <img src="/bcp-logo.svg" alt="BCP" className="max-h-8 w-full object-contain" />
    </span>
  );
}

function PaymentDetailsCard({
  method,
  showAll = false,
  className = "",
}: {
  method: PaymentMethod;
  showAll?: boolean;
  className?: string;
}) {
  const methods = showAll ? (["YAPE", "TRANSFER"] as PaymentMethod[]) : [method];

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <h3 className="text-sm font-black text-gray-950">{showAll ? "Medios de pago" : "Datos para pagar"}</h3>
      <div className="mt-3 grid gap-3">
        {methods.map((item) => {
          const detail = PAYMENT_DETAILS[item];
          return (
            <div key={item} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <PaymentBrandMark method={item} />
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-950">{detail.label}</p>
                  <p className="text-xs font-semibold text-gray-500">{detail.numberLabel}</p>
                </div>
              </div>
              <p className="mt-3 break-words text-2xl font-black tracking-normal text-amazon_blue">{detail.number}</p>
              <p className="mt-1 text-xs font-semibold text-gray-500">Titular</p>
              <p className="text-sm font-bold text-gray-900">{detail.holder}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { productData, userInfo } = useSelector((state: StateProps) => state.next);
  const isAdminSession = (session?.user as any)?.role === "ADMIN";
  const customerSession = !isAdminSession ? session : null;
  const storeUser = isAdminSession ? null : (userInfo as any);
  const autofillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutofillKey = useRef("");
  const trackedCheckoutKey = useRef("");

  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
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
  const [mounted, setMounted] = useState(false);
  const [shippingProfileChecked, setShippingProfileChecked] = useState(false);

  const sessionCustomerEmail = String((customerSession?.user as any)?.email || "").trim().toLowerCase();
  const checkoutEmail = sessionCustomerEmail || guestEmail.trim().toLowerCase();
  const isGuestCheckout = !sessionCustomerEmail;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (storeUser) {
      setName(storeUser.name || "");
      setPhone(storeUser.phone || "");
    }
  }, [storeUser]);

  useEffect(() => {
    const sessionEmail = String((customerSession?.user as any)?.email || "").trim().toLowerCase();
    if (!sessionEmail || typeof window === "undefined") {
      setShippingProfileChecked(true);
      return;
    }
    setShippingProfileChecked(false);
    let hasLocalProfile = false;
    try {
      const raw = window.localStorage.getItem(`rr_shipping_profile:${sessionEmail}`);
      if (raw) {
        const p = JSON.parse(raw);
        hasLocalProfile = true;
        setName(String(p.name || (customerSession?.user as any)?.name || ""));
        setDni(String(p.dni || ""));
        setPhone(String(p.phone || ""));
        setLocationLine(String(p.locationLine || ""));
        setShippingCarrier(String(p.shippingCarrier || "SHALOM") === "OLVA" ? "OLVA" : "SHALOM");
        setShalomAgency(String(p.shalomAgency || ""));
        setOlvaAddress(String(p.olvaAddress || ""));
        setOlvaReference(String(p.olvaReference || ""));
        setShowShippingForm(false);
        setSelectedSavedAddress(true);
        setShippingConfirmed(true);
        setShippingProfileChecked(true);
      }
    } catch {
      // Si el dato local esta corrupto, simplemente dejamos el formulario editable.
    }
    let alive = true;
    fetch("/api/account/shipping-profile")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        if (!data?.found) {
          if (!hasLocalProfile) {
            setShowShippingForm(false);
            setSelectedSavedAddress(false);
            setShippingConfirmed(false);
          }
          setShippingProfileChecked(true);
          return;
        }
        const p = data.profile || {};
        setName(String(p.name || (customerSession?.user as any)?.name || ""));
        setDni(String(p.dni || ""));
        setPhone(String(p.phone || ""));
        setLocationLine(String(p.locationLine || ""));
        setShippingCarrier(String(p.shippingCarrier || "SHALOM") === "OLVA" ? "OLVA" : "SHALOM");
        setShalomAgency(String(p.shalomAgency || ""));
        setOlvaAddress(String(p.olvaAddress || ""));
        setOlvaReference(String(p.olvaReference || ""));
        setShowShippingForm(false);
        setSelectedSavedAddress(true);
        setShippingConfirmed(true);
        window.localStorage.setItem(`rr_shipping_profile:${sessionEmail}`, JSON.stringify(p));
        setShippingProfileChecked(true);
      })
      .catch(() => {
        if (!alive) return;
        if (!hasLocalProfile) {
          setShowShippingForm(false);
          setSelectedSavedAddress(false);
          setShippingConfirmed(false);
        }
        setShippingProfileChecked(true);
      });
    return () => {
      alive = false;
    };
  }, [customerSession]);

  useEffect(() => {
    return () => {
      if (autofillTimer.current) clearTimeout(autofillTimer.current);
    };
  }, []);

  const totals = useMemo(() => {
    const subtotal = productData.reduce((sum: number, p: StoreProduct) => sum + getBundleLineTotal(p), 0);
    const discount = 0;
    const total = subtotal;
    return { subtotal, discount, total };
  }, [productData]);
  const totalUnits = useMemo(
    () => productData.reduce((sum: number, p: StoreProduct) => sum + p.quantity, 0),
    [productData]
  );
  const hydratedTotalUnits = mounted ? totalUnits : 0;

  useEffect(() => {
    if (!mounted || productData.length === 0 || totalUnits <= 0) return;
    const key = productData
      .map((item: StoreProduct) => `${item.productId || item._id}:${item.variantId || ""}:${item.quantity}`)
      .join("|");
    if (!key || trackedCheckoutKey.current === key) return;
    trackedCheckoutKey.current = key;
    trackInitiateCheckout({
      numItems: totalUnits,
      value: totals.total,
      contentIds: productData.map((item: StoreProduct) => item.productId || item._id),
    });
  }, [mounted, productData, totalUnits, totals.total]);

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
    if (isGuestCheckout && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) return false;
    if (!locationLine.trim()) return false;
    if (!paymentFile || !paymentPreview) return false;
    if (!acceptTerms) return false;
    if (shippingCarrier === "SHALOM" && !shalomAgency.trim()) return false;
    if (shippingCarrier === "OLVA" && (!olvaAddress.trim() || !olvaReference.trim())) return false;
    return true;
  };

  const isShippingReviewStep = !showShippingForm && !shippingConfirmed && !!name && !!phone && !!locationLine;
  const hasSavedShippingAddress = Boolean(
    name &&
      phone &&
      locationLine &&
      (shippingCarrier === "SHALOM" ? shalomAgency : olvaAddress)
  );

  const saveLocalShippingProfile = () => {
    const sessionEmail = String((customerSession?.user as any)?.email || "").trim().toLowerCase();
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
            email: checkoutEmail,
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
          promoCode: "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo confirmar el pedido.");
      }

      const saved = await res.json();
      const orderCode = saved?.orderCode || saved?.id || "";
      trackPurchase({
        transactionId: orderCode,
        value: totals.total,
        contentIds: productData.map((item: StoreProduct) => item.productId || item._id),
      });
      saveLocalShippingProfile();
      setSuccessId(orderCode);
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
          <p className="mt-2 text-gray-700">Tu pedido fue registrado correctamente.</p>
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-lg font-black text-emerald-800">
            Código de pedido: {successId}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Guarda este código. Lo necesitarás junto con tu correo para consultar el estado de tu pedido.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/track-orders?email=${encodeURIComponent(checkoutEmail)}&order=${encodeURIComponent(successId)}`}
              className="px-4 py-2 rounded bg-emerald-700 text-white text-sm font-semibold hover:brightness-95"
            >
              Ver estado del pedido
            </Link>
            <Link href="/" className="px-4 py-2 rounded bg-amazon_blue text-white text-sm font-semibold hover:brightness-95">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-3 pb-[104px] pt-0 md:px-6 md:py-6">
      <Head>
        <title>Rossy Resina - Checkout</title>
      </Head>
      <div className="sticky top-0 z-30 -mx-3 mb-3 border-b border-gray-200 bg-white px-4 pb-3 pt-4 md:hidden">
        <div className="grid grid-cols-[46px_minmax(0,1fr)_46px] items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center text-gray-950"
            aria-label="Volver"
          >
            <ChevronLeftIcon className="h-6 w-6 stroke-[2.5]" />
          </button>
          <h1 className="text-center text-xl font-black text-gray-950">Pagar ({hydratedTotalUnits})</h1>
          <button
            type="button"
            className="ml-auto flex h-9 w-9 items-center justify-center text-gray-950"
            aria-label="Menú"
          >
            <Bars3Icon className="h-7 w-7 stroke-[2.2]" />
          </button>
        </div>
      </div>
      {!mounted ? (
        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-lg">Cargando checkout...</p>
        </div>
      ) : productData.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-lg">Tu carrito está vacío.</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-amazon_blue px-5 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Ir a comprar
          </Link>
        </div>
      ) : status === "loading" || !shippingProfileChecked ? (
        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-lg">Preparando tus datos...</p>
        </div>
      ) : !hasSavedShippingAddress && !showShippingForm ? (
        <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow md:p-8">
          {isGuestCheckout && (
            <div className="mb-5 rounded-lg border border-amazon_blue/30 bg-amazon_blue/5 p-4">
              <p className="text-sm font-black text-gray-950">¿Ya tienes cuenta?</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Inicia sesión o regístrate para guardar tu dirección y no llenar el formulario la próxima vez. También puedes continuar sin cuenta.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/register?callbackUrl=/checkout"
                  className="flex h-11 items-center justify-center rounded-full bg-amazon_blue px-5 text-sm font-black text-white hover:brightness-95"
                >
                  Registrarme
                </Link>
                <Link
                  href="/sign-in?callbackUrl=/checkout"
                  className="flex h-11 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-black text-gray-900 hover:bg-gray-50"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          )}

          {isGuestCheckout ? (
            <>
              <h2 className="text-2xl font-black text-gray-950">Completa tu dirección de envío</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Ingresa tus datos de entrega para continuar con el pago.
              </p>
              <button
                type="button"
                onClick={() => setShowShippingForm(true)}
                className="mt-5 flex h-12 items-center justify-center rounded-full bg-amazon_blue px-5 text-sm font-black text-white hover:brightness-95"
              >
                Continuar
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-950">Completa tu dirección de envío</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Tu cuenta está activa, pero no encontramos una dirección guardada. Agrégala una vez y luego aparecerá aquí automáticamente.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/shipping-address"
                  className="flex h-12 items-center justify-center rounded-full bg-amazon_blue px-5 text-sm font-black text-white hover:brightness-95"
                >
                  Guardar dirección
                </Link>
                <button
                  type="button"
                  onClick={() => setShowShippingForm(true)}
                  className="flex h-12 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-black text-gray-900 hover:bg-gray-50"
                >
                  Usar otra dirección
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={isShippingReviewStep ? "mx-auto max-w-5xl" : "grid gap-3 lg:grid-cols-3 lg:gap-6"}>
          <section className={isShippingReviewStep ? "bg-white p-0" : "space-y-3 lg:col-span-2"}>
            <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
              <h2 className="text-lg font-black text-gray-950 md:text-2xl">Dirección de entrega</h2>
              <p className="mt-1 text-sm text-gray-600 md:text-base">Usaremos la dirección guardada en tu cuenta.</p>

              {!showShippingForm && name && phone && locationLine ? (
                <>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className={`rounded-lg border p-4 ${selectedSavedAddress ? "border-amazon_blue bg-amazon_blue/5" : "border-gray-300 bg-white"}`}>
                      <p className="text-base font-black text-gray-950 md:text-lg">{name}</p>
                      <p className="mt-1 text-sm font-semibold text-amazon_blue md:text-base">
                        {shippingCarrier === "OLVA" ? olvaAddress : `Agencia Shalom: ${shalomAgency}`}
                      </p>
                      <p className="mt-1 text-sm text-gray-800 md:text-base">{locationLine}</p>
                      {shippingCarrier === "OLVA" && olvaReference && (
                        <p className="text-sm text-gray-800 md:text-base">Referencia: {olvaReference}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-800 md:text-base">WhatsApp: {phone}</p>
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowShippingForm(true);
                            setSelectedSavedAddress(false);
                            setShippingConfirmed(false);
                          }}
                          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-black text-gray-950 hover:bg-gray-50"
                        >
                          Deseo usar otra dirección
                        </button>
                      </div>
                    </div>
                    <PaymentDetailsCard showAll method={paymentMethod} className="hidden lg:block" />
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
              {isGuestCheckout && (
                <div>
                  <label className="text-sm text-gray-600">Correo para consultar tu pedido</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              )}
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
                <label className="text-sm text-gray-600">Agencia de envío</label>
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
                  <label className="text-sm text-gray-600">Agencia Shalom donde recogerá</label>
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
                    <label className="text-sm text-gray-600">Dirección donde Olva entregará</label>
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
                <label className="text-sm text-gray-600">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value === "TRANSFER" ? "TRANSFER" : "YAPE")}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="YAPE">Yape</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
                <PaymentDetailsCard method={paymentMethod} className="mt-3 lg:hidden" />
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
                <span>Acepto que este pedido será confirmado manualmente por el equipo de Rossy Resina.</span>
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
                  <PaymentDetailsCard method={paymentMethod} className="mt-3 lg:hidden" />
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
                  <span>Acepto que este pedido será confirmado manualmente por el equipo de Rossy Resina.</span>
                </label>
              </div>
            )}
            </div>
          </section>

          {!isShippingReviewStep && (
          <aside className="hidden h-fit space-y-4 lg:col-span-1 lg:sticky lg:top-24 lg:block">
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
                    <div className="font-semibold"><FormattedPrice amount={getBundleLineTotal(p)} /></div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span><FormattedPrice amount={totals.subtotal} /></span></div>
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span><FormattedPrice amount={totals.total} /></span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
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

          {mounted
            ? createPortal(
                <aside
                  className="md:hidden"
                  style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    width: "100%",
                  }}
                >
                  <div className="bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_18px_rgba(17,24,39,0.12)]">
                    {errorMsg && <p className="mb-1 text-xs font-semibold text-red-600">{errorMsg}</p>}
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500">Total</p>
                        <p className="text-2xl font-black leading-none text-amazon_blue">
                          <FormattedPrice amount={totals.total} />
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleConfirmOrder}
                        disabled={submitting}
                        className="flex h-14 min-w-[220px] items-center justify-center rounded-full bg-amazon_blue px-5 text-base font-black text-white shadow-[0_10px_22px_rgba(203,41,158,0.24)] disabled:opacity-60"
                      >
                        {submitting ? "Enviando..." : `Finalizar compra (${totalUnits})`}
                      </button>
                    </div>
                  </div>
                </aside>,
                document.body
              )
            : null}
        </div>
      )}
    </div>
  );
}
