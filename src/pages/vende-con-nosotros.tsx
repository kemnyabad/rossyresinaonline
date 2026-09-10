import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  BanknotesIcon,
  CheckCircleIcon,
  MegaphoneIcon,
  PhotoIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { getDepartment, peruDepartments } from "@/lib/peruLocations";
import { trackSellerApplicationSubmitted } from "@/lib/metaPixel";
import logo from "@/images/logo.jpg";

const sellerBenefits = [
  { label: "Publicación gratuita", icon: ShoppingBagIcon },
  { label: "Perfil destacado", icon: StarIcon },
  { label: "Difusión en redes", icon: MegaphoneIcon },
  { label: "0% comisión inicial", icon: BanknotesIcon },
  { label: "Solo 10 cupos disponibles", icon: UserGroupIcon },
];

const emptyForm = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  dni: "",
  businessName: "",
  department: "Lima",
  province: "Lima",
  district: "Lima",
  customLocation: "",
  whatsapp: "",
  productType: "",
  description: "",
  socialUrl: "",
  logoUrl: "",
  dniFrontUrl: "",
  dniBackUrl: "",
  businessPhotoUrl: "",
};

const isLocalhostBrowser = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

export default function VendeConNosotrosPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [onboardingError, setOnboardingError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [marketplaceContext, setMarketplaceContext] = useState<any>(null);
  const [showTestDataButton, setShowTestDataButton] = useState(false);

  const sessionEmail = String(session?.user?.email || "").trim().toLowerCase();
  const application = marketplaceContext?.application || null;
  const shop = marketplaceContext?.shop || null;
  const isApproved = marketplaceContext?.role === "SELLER" || application?.status === "APPROVED";
  const isPendingReview = !isApproved && application?.status === "PENDING";
  const showSellerOnboarding = !isApproved && (submitted || application?.status === "PENDING");

  const loadMarketplaceContext = async () => {
    try {
      const res = await fetch("/api/marketplace/me", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      setMarketplaceContext(res.ok ? data : null);
    } catch {
      setMarketplaceContext(null);
    }
  };

  useEffect(() => {
    loadMarketplaceContext();
    setShowTestDataButton(isLocalhostBrowser());
  }, []);

  useEffect(() => {
    if (sessionEmail && !form.email) {
      setForm((current) => ({ ...current, email: sessionEmail, fullName: String(session?.user?.name || current.fullName || "") }));
    }
  }, [sessionEmail, session?.user?.name, form.email]);

  const update = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => {
      if (key === "department") {
        const department = getDepartment(value);
        const province = department.provinces[0]?.name || "";
        const district = department.provinces[0]?.districts[0] || "";
        return { ...current, department: value, province, district };
      }
      if (key === "province") {
        const department = getDepartment(current.department);
        const province = department.provinces.find((item) => item.name === value) || department.provinces[0];
        return { ...current, province: value, district: province?.districts[0] || "" };
      }
      return { ...current, [key]: value };
    });
  };

  const ensureAccountSession = async () => {
    if (sessionEmail) return true;

    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un email válido para crear tu cuenta de vendedor.");
      return false;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    if (!form.fullName.trim()) {
      setError("Ingresa tu nombre completo.");
      return false;
    }
    if (form.dni.replace(/\D/g, "").length < 8) {
      setError("Ingresa un DNI válido de 8 dígitos.");
      return false;
    }
    if (!form.whatsapp.trim()) {
      setError("Ingresa tu WhatsApp de contacto.");
      return false;
    }

    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.fullName || email.split("@")[0],
        email,
        password: form.password,
        dni: form.dni.replace(/\D/g, "") || getSellerAutoDni(email),
        phone: form.whatsapp || "Por coordinar",
        locationLine: getSellerLocation(form),
        shippingCarrier: "SHALOM",
        shalomAgency: "Por coordinar",
      }),
    });

    if (!registerRes.ok && registerRes.status !== 409) {
      const fallbackLogin = await signIn("credentials", {
        email,
        password: form.password,
        redirect: false,
        callbackUrl: "/vende-con-nosotros",
      });
      if (!fallbackLogin?.error) return true;
      const body = await registerRes.json().catch(() => ({}));
      setError(String(body?.error || "No se pudo crear la cuenta de vendedor."));
      return false;
    }

    const login = await signIn("credentials", {
      email,
      password: form.password,
      redirect: false,
      callbackUrl: "/vende-con-nosotros",
    });

    if (login?.error) {
      setError(registerRes.status === 409 ? "Este correo ya existe. Inicia sesión o usa la contraseña correcta para continuar." : "No se pudo iniciar sesión con la cuenta creada.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSending(true);

    try {
      const sellerLocation = getSellerLocation(form);
      if (!sellerLocation) {
        setError("Completa la ciudad, provincia y distrito desde donde vendes.");
        return;
      }
      if (!form.fullName.trim() || form.dni.replace(/\D/g, "").length < 8 || !form.whatsapp.trim()) {
        setError("Completa tu nombre, DNI y WhatsApp antes de continuar.");
        return;
      }

      const accountReady = await ensureAccountSession();
      if (!accountReady) return;
      setSubmitted(true);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  const handleApplicationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnboardingError("");
    setSending(true);

    try {
      const sellerLocation = getSellerLocation(form);
      const required = [
        form.fullName,
        form.dni,
        form.businessName,
        sellerLocation,
        form.whatsapp,
        form.productType,
        form.description,
        form.dniFrontUrl,
        form.dniBackUrl,
        form.businessPhotoUrl,
      ];
      if (required.some((value) => !String(value || "").trim())) {
        setOnboardingError("Completa los datos del vendedor, negocio, fotos del DNI y foto del emprendimiento.");
        return;
      }
      if (form.dni.replace(/\D/g, "").length < 8) {
        setOnboardingError("Ingresa un DNI válido de 8 dígitos.");
        return;
      }

      const payload = {
        fullName: form.fullName.trim(),
        sellerDni: form.dni.replace(/\D/g, ""),
        businessName: form.businessName.trim(),
        city: sellerLocation,
        whatsapp: form.whatsapp.trim(),
        productType: form.productType.trim(),
        description: form.description.trim(),
        socialUrl: form.socialUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        dniFrontUrl: form.dniFrontUrl,
        dniBackUrl: form.dniBackUrl,
        businessPhotoUrl: form.businessPhotoUrl,
      };

      const res = await fetch("/api/marketplace/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOnboardingError(String(body?.error || "No se pudo enviar tu solicitud."));
        return;
      }

      trackSellerApplicationSubmitted({
        businessName: payload.businessName,
        city: payload.city,
        productType: payload.productType,
      });

      setSubmitted(true);
      setMarketplaceContext((current: any) => ({
        ...(current || {}),
        role: "CUSTOMER",
        application: body.application,
      }));
      await loadMarketplaceContext();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  const handleImageFile = async (key: "dniFrontUrl" | "dniBackUrl" | "businessPhotoUrl" | "logoUrl", file?: File | null) => {
    if (!file) return;
    setOnboardingError("");
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setOnboardingError("Sube imágenes en formato JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 1200 * 1024) {
      setOnboardingError("Cada imagen debe pesar máximo 1.2MB.");
      return;
    }
    setSending(true);
    try {
      const data = await readFileAsDataUrl(file);
      const res = await fetch("/api/marketplace/upload-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, kind: key, data }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOnboardingError(String(body?.error || "No se pudo subir la imagen."));
        return;
      }
      update(key, String(body.url || ""));
    } catch {
      setOnboardingError("No se pudo subir la imagen. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  const fillSellerTestData = () => {
    const stamp = Date.now().toString().slice(-6);
    setError("");
    setOnboardingError("");
    setForm((current) => ({
      ...current,
      email: current.email || `vendedora.prueba${stamp}@rossyresina.test`,
      password: current.password || "Prueba123",
      confirmPassword: current.confirmPassword || "Prueba123",
      fullName: "María Prueba Vendedora",
      dni: `70${stamp}`.slice(0, 8).padEnd(8, "1"),
      businessName: "Creaciones Prueba Rossy",
      whatsapp: "51999999999",
      productType: "Llaveros, dijes, lapiceros personalizados y piezas en resina",
      description: "Emprendimiento de prueba para validar el flujo de alta de vendedores en Rossy Resina.",
      socialUrl: "https://instagram.com/creaciones_prueba_rossy",
      logoUrl: "/favicon-96x96.png",
      dniFrontUrl: "/web-app-manifest-512x512.png",
      dniBackUrl: "/web-app-manifest-192x192.png",
      businessPhotoUrl: "/creations/1773682497648_Catalogo_Express_Rossy_Resina__2_.png",
    }));
  };

  return (
    <>
      <Head>
        <title>Vende tus creaciones en Rossy Resina | Fundadoras</title>
        <meta name="description" content="Postula como emprendedora fundadora para vender tus creaciones dentro de Rossy Resina." />
      </Head>

      <main className="min-h-screen bg-white text-slate-950">
        <SellerTopbar />
        {isPendingReview ? (
          <SellerPendingReview application={application} />
        ) : showSellerOnboarding ? (
          <SellerOnboarding
            form={form}
            error={onboardingError}
            sending={sending}
            location={application?.city || getSellerLocation(form)}
            onUpdate={update}
            onImageFile={handleImageFile}
            onFillTestData={fillSellerTestData}
            showTestDataButton={showTestDataButton}
            onSubmit={handleApplicationSubmit}
          />
        ) : (
          <>
            <section className="relative overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-[url('/seller-center-bg.jpg')] bg-cover bg-center opacity-100" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(228,20,127,0.22),transparent_34%),linear-gradient(90deg,rgba(2,6,23,0.88),rgba(2,6,23,0.58),rgba(2,6,23,0.22))]" />

              <div className="relative mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start lg:px-8 lg:py-6">
                <section className="flex flex-col justify-start pt-3 text-white lg:pt-5">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-pink-100 backdrop-blur">
                    <SparklesIcon className="h-4 w-4" />
                    Primeras emprendedoras fundadoras
                  </div>
                  <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                    Vende tus creaciones en Rossy Resina
                  </h1>
                  <p className="mt-3 max-w-2xl text-xl font-black leading-8 text-white sm:text-2xl">
                    Buscamos a las primeras emprendedoras fundadoras
                  </p>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                    Postula tu emprendimiento y forma parte del primer grupo de tiendas creadoras dentro del marketplace de Rossy Resina.
                  </p>
                  <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
                    {sellerBenefits.map((benefit) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={benefit.label} className="flex min-h-[52px] items-center gap-3 rounded-lg border border-white bg-white px-3 py-2 text-sm font-black text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                          <Icon className="h-5 w-5 shrink-0 text-[#ff8ac4]" />
                          <span>{benefit.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-6 max-w-xl rounded-lg border border-white bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                    Rossy Resina trabajará para llevar clientes a tu tienda.
                  </p>
                  <Link
                    href="#postulacion-fundadora"
                    className="mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-lg bg-[#e4147f] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(228,20,127,0.28)] transition hover:bg-[#c91473] sm:w-fit"
                  >
                    Quiero ser fundadora
                  </Link>
                </section>

                <aside id="postulacion-fundadora" className="hidden self-start rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl lg:block">
                  <SellerRegisterForm
                    form={form}
                    sessionEmail={sessionEmail}
                    error={error}
                    sending={sending}
                    submitted={submitted}
                    isApproved={isApproved}
                    shop={shop}
                    onUpdate={update}
                    onFillTestData={fillSellerTestData}
                    showTestDataButton={showTestDataButton}
                    onSubmit={handleSubmit}
                  />
                </aside>
              </div>
            </section>

            <section className="bg-[#fff7fb] px-4 py-5 sm:px-6 lg:hidden">
              <div className="mx-auto max-w-xl rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
                <SellerRegisterForm
                  form={form}
                  sessionEmail={sessionEmail}
                  error={error}
                  sending={sending}
                  submitted={submitted}
                  isApproved={isApproved}
                  shop={shop}
                  onUpdate={update}
                  onFillTestData={fillSellerTestData}
                  showTestDataButton={showTestDataButton}
                  onSubmit={handleSubmit}
                  compact
                />
              </div>
            </section>

            <section className="bg-[#fff7fb] px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
                <InfoCard number="1" title="Registro rápido" text="Crea tu cuenta de vendedor y envía tus datos de tienda." />
                <InfoCard number="2" title="Revisión Rossy" text="Validamos tu solicitud y luego habilitamos tu panel de vendedor." />
                <InfoCard number="3" title="Publica productos" text="Tus productos aprobados aparecen como productos del marketplace Rossy Resina." />
              </div>
            </section>
          </>
        )}
      </main>

    </>
  );
}

function SellerTopbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#749f14] bg-[#86b817] text-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-[1720px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Rossy Resina Seller Center">
          <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(17,24,39,0.16)] ring-2 ring-white">
            <Image src={logo} alt="Rossy Resina" className="h-full w-full object-contain" priority />
          </span>
          <span className="h-12 w-[3px] shrink-0 rounded-full bg-[#e4147f] shadow-[0_0_0_1px_rgba(255,255,255,0.18)]" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[24px] font-bold leading-7 text-[#e4147f] [text-shadow:1.5px_0_0_#fff,-1.5px_0_0_#fff,0_1.5px_0_#fff,0_-1.5px_0_#fff,1px_1px_0_#fff,-1px_1px_0_#fff,1px_-1px_0_#fff,-1px_-1px_0_#fff]">
              Rossy Resina
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-medium leading-5 text-white/90">Seller Center</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-white sm:gap-5">
          <span className="hidden min-h-[48px] items-center gap-2 rounded-lg px-2 py-1 sm:flex">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e4147f] text-xs font-black text-white ring-2 ring-white">
              PE
            </span>
            <span className="text-[15px] font-bold leading-tight">Perú</span>
          </span>
          <span className="hidden min-h-[48px] items-center px-2 text-[15px] font-bold leading-tight text-white sm:flex">
            ES
          </span>
          <Link
            href="/sign-in?callbackUrl=/vende-con-nosotros"
            className="group hidden min-h-[58px] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white hover:text-[#e4147f] md:flex"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 text-slate-700 ring-1 ring-gray-200 transition-colors group-hover:bg-white group-hover:text-[#e4147f] group-hover:ring-[#e4147f]">
              <UserIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 leading-tight text-left">
              <span className="block text-sm font-bold text-white transition-colors group-hover:text-[#e4147f]">Cuenta</span>
              <span className="block whitespace-nowrap text-xl font-black leading-5 text-white transition-colors group-hover:text-[#e4147f]">
                Mi perfil
              </span>
            </span>
          </Link>
          <Link
            href="#postulacion-fundadora"
            className="group inline-flex min-h-[58px] items-center gap-3 rounded-lg bg-[#e4147f] px-4 py-2 text-white shadow-[0_10px_22px_rgba(228,20,127,0.22)] transition hover:bg-[#c91473] sm:px-5"
          >
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#e4147f] sm:flex">
              <ShoppingBagIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 leading-tight text-left">
              <span className="hidden text-sm font-bold text-white sm:block">Postulación</span>
              <span className="block whitespace-nowrap text-base font-black leading-5 text-white sm:text-lg">
                Quiero ser fundadora
              </span>
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SellerPendingReview({ application }: { application: any }) {
  return (
    <section className="min-h-[calc(100vh-80px)] bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm sm:p-8">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-5 text-3xl font-black text-slate-950">Solicitud enviada para revisión</h1>
        <p className="mt-3 text-base font-medium leading-7 text-slate-700">
          Recibimos la información de tu emprendimiento. Rossy Resina revisará tus datos y documentos antes de activar tu tienda.
        </p>

        <div className="mt-7 grid gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-left text-sm sm:grid-cols-2">
          <InfoReview label="Emprendimiento" value={application?.businessName} />
          <InfoReview label="Vendedora" value={application?.fullName} />
          <InfoReview label="Ubicación" value={application?.city} />
          <InfoReview label="Estado" value="Pendiente de revisión" />
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-900">
            Volver a la tienda
          </Link>
          <Link href="/account" className="inline-flex h-12 items-center justify-center rounded-lg bg-[#e4147f] px-5 text-sm font-black text-white">
            Ver mi cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}

function InfoReview({ label, value }: { label: string; value?: string }) {
  return (
    <p>
      <span className="block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <span className="mt-1 block break-words font-bold text-slate-900">{String(value || "Registrado")}</span>
    </p>
  );
}

function SellerOnboarding({
  form,
  error,
  sending,
  location,
  onUpdate,
  onImageFile,
  onFillTestData,
  showTestDataButton,
  onSubmit,
}: {
  form: typeof emptyForm;
  error: string;
  sending: boolean;
  location: string;
  onUpdate: (key: keyof typeof emptyForm, value: string) => void;
  onImageFile: (key: "dniFrontUrl" | "dniBackUrl" | "businessPhotoUrl" | "logoUrl", file?: File | null) => void;
  onFillTestData: () => void;
  showTestDataButton: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="min-h-[calc(100vh-56px)] bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit}>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Postulación de fundadora</h1>
          <p className="mt-2 text-base font-medium leading-7 text-slate-600">Completa un formulario corto para que podamos conocer tu emprendimiento y revisar tus productos.</p>
          {showTestDataButton && (
            <button
              type="button"
              onClick={onFillTestData}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-pink-200 bg-[#fff7fb] px-4 text-sm font-black text-[#e4147f] transition hover:bg-[#fff0f7]"
            >
              Rellenar datos de prueba
            </button>
          )}

          <div className="mt-7 grid gap-5">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo">
                <input value={form.fullName} onChange={(e) => onUpdate("fullName", e.target.value)} className={inputClass} />
              </Field>
              <Field label="DNI del vendedor">
                <input value={form.dni} onChange={(e) => onUpdate("dni", e.target.value.replace(/\D/g, ""))} className={inputClass} inputMode="numeric" maxLength={8} />
              </Field>
            </div>

            <Field label="Ubicación comercial">
              <input value={location || "Perú"} readOnly className={inputClass} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del emprendimiento">
                <input value={form.businessName} onChange={(e) => onUpdate("businessName", e.target.value)} className={inputClass} />
              </Field>
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={(e) => onUpdate("whatsapp", e.target.value)} className={inputClass} inputMode="tel" />
              </Field>
            </div>

            <Field label="¿Qué productos vendes?">
              <input value={form.productType} onChange={(e) => onUpdate("productType", e.target.value)} className={inputClass} placeholder="Ej: llaveros, joyería, piezas personalizadas" />
            </Field>

            <Field label="Descripción breve del negocio">
              <textarea value={form.description} onChange={(e) => onUpdate("description", e.target.value)} className={`${inputClass} h-28 py-3`} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram, Facebook o TikTok">
                <input value={form.socialUrl} onChange={(e) => onUpdate("socialUrl", e.target.value)} className={inputClass} placeholder="https://instagram.com/..." />
              </Field>
              <Field label="Logo o foto principal">
                <input onChange={(e: ChangeEvent<HTMLInputElement>) => onImageFile("logoUrl", e.target.files?.[0])} type="file" accept="image/png,image/jpeg,image/webp" className={fileInputClass} />
              </Field>
            </div>

            <div className="rounded-xl border border-pink-100 bg-[#fff7fb] p-4">
              <p className="flex items-center gap-2 text-base font-black text-slate-900">
                <PhotoIcon className="h-5 w-5 text-[#e4147f]" />
                Fotos de productos y verificación
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">Las fotos de tus productos nos ayudan a evaluar tu tienda. También pedimos DNI para validar identidad antes de aprobar una vendedora.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <UploadField label="DNI - frente" value={form.dniFrontUrl} onChange={(file) => onImageFile("dniFrontUrl", file)} />
                <UploadField label="DNI - reverso" value={form.dniBackUrl} onChange={(file) => onImageFile("dniBackUrl", file)} />
                <UploadField label="Fotos de productos" value={form.businessPhotoUrl} onChange={(file) => onImageFile("businessPhotoUrl", file)} />
              </div>
            </div>

            <button type="submit" disabled={sending} className="mt-3 h-12 w-full max-w-sm rounded-lg bg-[#e4147f] px-5 text-sm font-black text-white transition hover:bg-[#c91473] disabled:opacity-60">
              {sending ? "Enviando postulación..." : "Quiero ser fundadora"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function SellerRegisterForm({
  form,
  sessionEmail,
  error,
  sending,
  submitted,
  isApproved,
  shop,
  onUpdate,
  onFillTestData,
  showTestDataButton,
  onSubmit,
  compact = false,
}: any) {
  const selectedDepartment = getDepartment(form.department);
  const selectedProvince = selectedDepartment.provinces.find((item) => item.name === form.province) || selectedDepartment.provinces[0];

  if (isApproved) {
    return (
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-black text-slate-950">Tu tienda está activa</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Ya puedes administrar tus productos desde tu panel de vendedor.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/mi-tienda" className="inline-flex h-12 items-center justify-center rounded-lg bg-[#e4147f] px-5 text-sm font-black text-white">
            Ir a Mi Tienda
          </Link>
          {shop?.slug && (
            <Link href={`/tienda/${shop.slug}`} className="inline-flex h-12 items-center justify-center rounded-lg border border-pink-200 px-5 text-sm font-black text-slate-900">
              Ver tienda pública
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-950">
          Postula para ser <span className="text-[#e4147f]">fundadora</span>
        </h2>
      </div>

      {showTestDataButton && (
        <button
          type="button"
          onClick={onFillTestData}
          className="mt-5 h-11 w-full rounded-lg border border-pink-200 bg-[#fff7fb] px-4 text-sm font-black text-[#e4147f] transition hover:bg-[#fff0f7]"
        >
          Rellenar datos de prueba
        </button>
      )}

      {submitted && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          Gracias por registrarte. Revisaremos tu solicitud y te contactaremos por WhatsApp.
        </div>
      )}
      {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <div className={`mt-5 grid gap-4 ${compact ? "" : "max-h-[68vh] overflow-y-auto pr-1"}`}>
        <Field label="¿Desde qué ciudad vendes?">
          <select value={form.department} onChange={(e) => onUpdate("department", e.target.value)} className={inputClass}>
            {peruDepartments.map((department) => (
              <option key={department.name} value={department.name}>{department.name}</option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provincia">
            <select value={form.province} onChange={(e) => onUpdate("province", e.target.value)} className={inputClass}>
              {selectedDepartment.provinces.map((province) => (
                <option key={province.name} value={province.name}>{province.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Distrito">
            <select value={form.district} onChange={(e) => onUpdate("district", e.target.value)} className={inputClass}>
              {(selectedProvince?.districts || []).map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Si no encuentras tu distrito, escríbelo aquí">
          <input value={form.customLocation} onChange={(e) => onUpdate("customLocation", e.target.value)} className={inputClass} placeholder="Ej: Departamento - Provincia - Distrito" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input value={form.fullName} onChange={(e) => onUpdate("fullName", e.target.value)} className={inputClass} />
          </Field>
          <Field label="DNI">
            <input value={form.dni} onChange={(e) => onUpdate("dni", e.target.value.replace(/\D/g, ""))} className={inputClass} inputMode="numeric" maxLength={8} />
          </Field>
          <Field label="WhatsApp">
            <input value={form.whatsapp} onChange={(e) => onUpdate("whatsapp", e.target.value)} className={inputClass} inputMode="tel" />
          </Field>
        </div>

        {!sessionEmail && (
          <>
            <Field label="Email o número de teléfono">
              <input value={form.email} onChange={(e) => onUpdate("email", e.target.value)} className={inputClass} type="email" />
            </Field>
            <Field label="Contraseña">
              <input value={form.password} onChange={(e) => onUpdate("password", e.target.value)} className={inputClass} type="password" />
            </Field>
            <Field label="Confirmar contraseña">
              <input value={form.confirmPassword} onChange={(e) => onUpdate("confirmPassword", e.target.value)} className={inputClass} type="password" />
            </Field>
          </>
        )}
      </div>

      <button type="submit" disabled={sending} className="mt-5 h-14 w-full rounded-lg bg-[#e4147f] px-5 text-lg font-black text-white transition hover:bg-[#c91473] disabled:opacity-60">
        {sending ? "Enviando solicitud..." : "Quiero ser fundadora"}
      </button>

      <p className="mt-4 text-center text-sm leading-6 text-slate-500">
        Al continuar, aceptas la revisión de Rossy Resina y nuestras políticas para vendedores.
      </p>
      <div className="mt-5 border-t border-slate-200 pt-4 text-center text-sm font-bold text-slate-700">
        ¿Ya tienes cuenta?{" "}
        <Link href="/sign-in?callbackUrl=/vende-con-nosotros" className="text-[#e4147f] hover:underline">
          Inicia sesión
        </Link>
      </div>
    </form>
  );
}

const inputClass = "h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#e4147f] focus:ring-2 focus:ring-pink-100";
const fileInputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#fff0f7] file:px-3 file:py-2 file:font-bold file:text-[#e4147f]";

function getSellerLocation(form: typeof emptyForm) {
  const custom = String(form.customLocation || "").trim();
  if (custom) return custom;
  return [form.department, form.province, form.district].map((item) => String(item || "").trim()).filter(Boolean).join(" - ");
}

function getSellerAutoDni(email: string) {
  let hash = 0;
  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return String(hash % 100000000).padStart(8, "0");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-black text-slate-800">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function UploadField({ label, value, onChange }: { label: string; value: string; onChange: (file?: File | null) => void }) {
  return (
    <label className="block text-sm font-black text-slate-800">
      {label}
      <input onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0])} type="file" accept="image/png,image/jpeg,image/webp" className={`${fileInputClass} mt-2`} />
      {value && (
        <span className="mt-2 block overflow-hidden rounded-lg border border-pink-100 bg-white">
          <img src={value} alt={label} className="h-28 w-full object-cover" />
        </span>
      )}
    </label>
  );
}

function InfoCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4147f] text-lg font-black text-white">{number}</span>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
