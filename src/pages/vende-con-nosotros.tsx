import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getDepartment, peruDepartments } from "@/lib/peruLocations";

const sellerBenefits = [
  { label: "Vende dentro de Rossy Resina", icon: ShoppingBagIcon },
  { label: "Publica productos como en una tienda profesional", icon: SparklesIcon },
  { label: "Recibe consultas por WhatsApp", icon: ChatBubbleLeftRightIcon },
  { label: "Gestiona tu propia tienda", icon: BanknotesIcon },
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
};

export default function VendeConNosotrosPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState(emptyForm);
  const [companyType, setCompanyType] = useState("Persona natural");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [marketplaceContext, setMarketplaceContext] = useState<any>(null);

  const sessionEmail = String(session?.user?.email || "").trim().toLowerCase();
  const application = marketplaceContext?.application || null;
  const shop = marketplaceContext?.shop || null;
  const isApproved = marketplaceContext?.role === "SELLER" || application?.status === "APPROVED";
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

    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: email.split("@")[0],
        email,
        password: form.password,
        dni: getSellerAutoDni(email),
        phone: "Por coordinar",
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

      const accountReady = await ensureAccountSession();
      if (!accountReady) return;
      const sellerEmail = sessionEmail || form.email.trim().toLowerCase();
      const sellerName = sellerEmail.split("@")[0] || "Vendedora";

      const payload = {
        fullName: sellerName,
        businessName: `Tienda de ${sellerName}`,
        city: sellerLocation,
        whatsapp: "Por coordinar",
        productType: "Productos artesanales",
        description: "Solicitud de vendedor registrada desde el formulario simplificado.",
        socialUrl: "",
        logoUrl: "",
      };

      const res = await fetch("/api/marketplace/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(body?.error || "No se pudo enviar tu solicitud."));
        return;
      }

      setSubmitted(true);
      await loadMarketplaceContext();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Rossy Resina Seller Center | Vende con nosotros</title>
        <meta name="description" content="Regístrate para vender tus productos dentro del marketplace Rossy Resina." />
      </Head>

      <main className="min-h-screen bg-white text-slate-950">
        <SellerTopbar />
        {showSellerOnboarding ? (
          <SellerOnboarding
            companyType={companyType}
            location={application?.city || getSellerLocation(form)}
            onCompanyTypeChange={setCompanyType}
          />
        ) : (
          <>
            <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-[url('/seller-center-bg.jpg')] bg-cover bg-center opacity-100" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(228,20,127,0.16),transparent_34%),linear-gradient(90deg,rgba(2,6,23,0.78),rgba(2,6,23,0.46),rgba(2,6,23,0.14))]" />

              <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8 lg:py-5">
                <section className="flex min-h-[520px] flex-col justify-start pt-8 text-white lg:pt-12">
                  <h1 className="max-w-3xl text-5xl font-black leading-tight text-white sm:text-6xl">
                    Empieza a vender tus productos en Rossy Resina
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
                    Crea tu tienda, publica tus productos y llega a clientes que ya buscan resina, artesanía y productos personalizados.
                  </p>
                  <div className="mt-10 grid max-w-xl gap-5">
                    {sellerBenefits.map((benefit) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={benefit.label} className="flex items-center gap-4 text-lg font-bold text-white/78">
                          <Icon className="h-6 w-6 text-[#ff8ac4]" />
                          {benefit.label}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <aside className="hidden self-start rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl lg:block">
                  <SellerRegisterForm
                    form={form}
                    sessionEmail={sessionEmail}
                    error={error}
                    sending={sending}
                    submitted={submitted}
                    isApproved={isApproved}
                    shop={shop}
                    onUpdate={update}
                    onSubmit={handleSubmit}
                  />
                </aside>
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
    <header className="flex h-14 items-center justify-between border-b border-slate-900 bg-black px-4 text-white sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3">
        <div>
          <p className="text-base font-black leading-tight">Rossy Resina</p>
          <p className="text-[11px] font-semibold text-white/45">Seller Center</p>
        </div>
      </Link>
      <nav className="flex items-center gap-5 text-sm font-bold">
        <span className="hidden text-white/55 sm:inline">Perú</span>
        <Link href="/sign-in?callbackUrl=/vende-con-nosotros" className="text-white hover:text-[#ff8ac4]">
          Iniciar sesión
        </Link>
      </nav>
    </header>
  );
}

const companyTypes = [
  {
    label: "Persona natural",
    text: "Vendes con tu propio nombre y luego podrás completar los datos de tu tienda.",
  },
  {
    label: "Emprendimiento registrado",
    text: "Tu marca ya tiene nombre comercial y datos listos para revisión.",
  },
  {
    label: "Empresa privada",
    text: "Tu negocio está constituido y venderá productos desde una razón social.",
  },
  {
    label: "Distribuidora",
    text: "Comprarás o publicarás productos para abastecer a otras resineras.",
  },
];

function SellerOnboarding({
  companyType,
  location,
  onCompanyTypeChange,
}: {
  companyType: string;
  location: string;
  onCompanyTypeChange: (value: string) => void;
}) {
  return (
    <section className="min-h-[calc(100vh-56px)] bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Información comercial</h1>
          <p className="mt-2 text-base font-medium leading-7 text-slate-600">Te damos la bienvenida. Completa los datos comerciales para preparar tu tienda.</p>

          <div className="mt-7 grid gap-5">
            <Field label="Ubicación comercial">
              <input value={location || "Perú"} readOnly className={inputClass} />
            </Field>

            <div>
              <p className="text-base font-black text-slate-800">Tipo de empresa</p>
              <p className="mt-1 text-base font-medium leading-7 text-slate-500">Selecciona cómo venderás dentro de Rossy Resina.</p>
              <div className="mt-3 grid gap-3">
                {companyTypes.map((item) => {
                  const selected = companyType === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onCompanyTypeChange(item.label)}
                      className={`flex min-h-[74px] items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${
                        selected ? "border-[#e4147f] bg-[#fff4f9]" : "border-slate-200 bg-white hover:border-pink-200"
                      }`}
                    >
                      <span className={`mt-1 h-5 w-5 rounded-full border ${selected ? "border-[#e4147f] bg-[#e4147f] shadow-[inset_0_0_0_4px_#fff]" : "border-slate-300"}`} />
                      <span>
                        <span className="block text-base font-black text-slate-950">{item.label}</span>
                        <span className="mt-1 block text-base leading-6 text-slate-500">{item.text}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" className="mt-3 h-12 w-full max-w-sm rounded-lg bg-[#e4147f] px-5 text-sm font-black text-white transition hover:bg-[#c91473]">
              Siguiente
            </button>
          </div>
        </div>
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
          Regístrate para <span className="text-[#e4147f]">vender en Rossy Resina</span>
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 border-b border-slate-200 pb-5 text-left">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-[#e4147f]">1</span>
            <span className="text-sm font-black leading-tight text-[#e4147f]">Minuto<br />registro rápido</span>
          </div>
          <div className="flex items-center gap-2 border-l border-pink-200 pl-5">
            <ClockIcon className="h-9 w-9 text-[#e4147f]" />
            <span className="text-sm font-black leading-tight text-[#e4147f]">Revisión<br />por Rossy</span>
          </div>
        </div>
      </div>

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
        {sending ? "Enviando solicitud..." : "Regístrate como vendedor"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-black text-slate-800">
      {label}
      <div className="mt-2">{children}</div>
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
