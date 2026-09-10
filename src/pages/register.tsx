import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

type ShippingCarrier = "SHALOM" | "OLVA";
type RegisterStep = "method" | "email" | "name" | "dni" | "phone" | "shipping" | "password";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("method");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [locationLine, setLocationLine] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState<ShippingCarrier>("SHALOM");
  const [shalomAgency, setShalomAgency] = useState("");
  const [olvaAddress, setOlvaAddress] = useState("");
  const [olvaReference, setOlvaReference] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const callbackUrl = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/checkout";
  const signInUrl = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

  const steps: RegisterStep[] = ["email", "name", "dni", "phone", "shipping", "password"];
  const currentStepIndex = steps.indexOf(step);
  const stepMeta: Record<RegisterStep, { label: string; title: string; helper: string }> = {
    method: {
      label: "Inicio",
      title: "Elige cómo crear tu cuenta",
      helper: "Puedes registrarte con Google o continuar con tu correo.",
    },
    email: {
      label: "Correo",
      title: "Correo electrónico",
      helper: "Usaremos este correo para tu cuenta y seguimiento de pedidos.",
    },
    name: {
      label: "Nombre",
      title: "Nombres",
      helper: "Escribe tu nombre completo para identificar tus pedidos.",
    },
    dni: {
      label: "DNI",
      title: "DNI",
      helper: "Lo usamos para registrar correctamente la entrega.",
    },
    phone: {
      label: "Teléfono",
      title: "Teléfono o WhatsApp",
      helper: "Te contactaremos por este número para coordinar tu pedido.",
    },
    shipping: {
      label: "Envío",
      title: "Dirección de envío",
      helper: "Guarda la zona y el método de entrega que prefieres.",
    },
    password: {
      label: "Clave",
      title: "Contraseña",
      helper: "Crea una contraseña para entrar luego a tu cuenta.",
    },
  };

  const validateStep = () => {
    setError(null);
    if (step === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo válido.");
      return false;
    }
    if (step === "name" && name.trim().length < 3) {
      setError("Ingresa tu nombre completo.");
      return false;
    }
    if (step === "dni" && dni.trim().length < 8) {
      setError("Ingresa tu DNI.");
      return false;
    }
    if (step === "phone" && phone.trim().length < 7) {
      setError("Ingresa tu teléfono o WhatsApp.");
      return false;
    }
    if (step === "shipping") {
      if (!locationLine.trim()) {
        setError("Ingresa departamento, provincia y distrito.");
        return false;
      }
      if (shippingCarrier === "SHALOM" && !shalomAgency.trim()) {
        setError("Indica la agencia Shalom donde recibirás tu paquete.");
        return false;
      }
      if (shippingCarrier === "OLVA" && (!olvaAddress.trim() || !olvaReference.trim())) {
        setError("Indica dirección y referencia para Olva.");
        return false;
      }
    }
    if (step === "password") {
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return false;
      }
      if (password !== confirm) {
        setError("Las contraseñas no coinciden.");
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    const next = steps[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    setError(null);
    const prev = steps[currentStepIndex - 1];
    if (prev) setStep(prev);
    else setStep("method");
  };

  const renderStepContent = (inputClass: string, textareaClass: string) => (
    <>
      {step === "method" && (
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-black text-gray-900 hover:bg-gray-50"
          >
            <FcGoogle className="h-5 w-5" />
            Registrarme con Google
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="flex h-12 w-full items-center justify-center rounded-full bg-amazon_blue px-4 text-sm font-black text-white hover:brightness-95"
          >
            Registrarme con correo
          </button>
        </div>
      )}

      {step === "email" && (
        <StepPanel title="Correo electrónico">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setAccountExists(false);
              setError(null);
            }}
            placeholder="correo@ejemplo.com"
            className={inputClass}
          />
        </StepPanel>
      )}

      {step === "name" && (
        <StepPanel title="Nombres">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className={inputClass}
          />
        </StepPanel>
      )}

      {step === "dni" && (
        <StepPanel title="DNI">
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            placeholder="DNI"
            inputMode="numeric"
            className={inputClass}
          />
        </StepPanel>
      )}

      {step === "phone" && (
        <StepPanel title="Teléfono o WhatsApp">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 961770723"
            inputMode="tel"
            className={inputClass}
          />
        </StepPanel>
      )}

      {step === "shipping" && (
        <StepPanel title="Dirección de envío">
          <div className="grid gap-3">
            <input
              value={locationLine}
              onChange={(e) => setLocationLine(e.target.value)}
              placeholder="Departamento - Provincia - Distrito"
              className={inputClass}
            />
            <select
              value={shippingCarrier}
              onChange={(e) => setShippingCarrier(e.target.value === "OLVA" ? "OLVA" : "SHALOM")}
              className={inputClass}
            >
              <option value="SHALOM">Recoger en agencia Shalom</option>
              <option value="OLVA">Entrega a domicilio por Olva</option>
            </select>
            {shippingCarrier === "SHALOM" ? (
              <input
                value={shalomAgency}
                onChange={(e) => setShalomAgency(e.target.value)}
                placeholder="Agencia Shalom donde recogerás"
                className={inputClass}
              />
            ) : (
              <>
                <input
                  value={olvaAddress}
                  onChange={(e) => setOlvaAddress(e.target.value)}
                  placeholder="Dirección exacta"
                  className={inputClass}
                />
                <textarea
                  value={olvaReference}
                  onChange={(e) => setOlvaReference(e.target.value)}
                  placeholder="Referencia del domicilio"
                  className={textareaClass}
                />
              </>
            )}
          </div>
        </StepPanel>
      )}

      {step === "password" && (
        <StepPanel title="Contraseña">
          <div className="grid gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className={inputClass}
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirmar contraseña"
              className={inputClass}
            />
          </div>
        </StepPanel>
      )}
    </>
  );

  const renderStepActions = () =>
    step !== "method" ? (
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="h-12 flex-1 rounded-full border border-gray-300 bg-white px-4 text-sm font-black text-gray-900 hover:bg-gray-50"
        >
          Atrás
        </button>
        {step === "password" ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-12 flex-[1.4] rounded-full bg-amazon_blue px-4 text-sm font-black text-white hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className="h-12 flex-[1.4] rounded-full bg-amazon_blue px-4 text-sm font-black text-white hover:brightness-95"
          >
            Continuar
          </button>
        )}
      </div>
    ) : null;

  const handleSubmit = async () => {
    setError(null);
    setAccountExists(false);
    if (!name || !email || !dni || !phone || !locationLine || !password) {
      setError("Completa todos los campos");
      return;
    }
    if (shippingCarrier === "SHALOM" && !shalomAgency) {
      setError("Indica la agencia Shalom donde recibiras tu paquete");
      return;
    }
    if (shippingCarrier === "OLVA" && (!olvaAddress || !olvaReference)) {
      setError("Indica direccion y referencia para Olva");
      return;
    }
      if (password !== confirm) {
        setError("Las contrasenas no coinciden");
        return;
      }
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          dni,
          phone,
          locationLine,
          shippingCarrier,
          shalomAgency,
          olvaAddress,
          olvaReference,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setAccountExists(true);
          setError("Este correo ya está registrado. Inicia sesión para continuar.");
          return;
        }
        setError(data.error || "No se pudo registrar");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (typeof window !== "undefined" && data?.profile) {
        window.localStorage.setItem(`rr_shipping_profile:${email.trim().toLowerCase()}`, JSON.stringify(data.profile));
      }
      await signIn("credentials", { email, password, callbackUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-gray-100 to-transparent px-4 py-8 md:px-6 md:py-12">
      <Head>
        <title>Crear cuenta  -  Rossy Resina</title>
      </Head>
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow md:hidden">
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-1 shadow-md ring-2 ring-white/60">
            <Image src={require("@/images/logo.jpg")} alt="Logo Rossy Resina" width={64} height={64} className="rounded-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-amazon_blue">Crear cuenta</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Registra tu cuenta y la dirección donde recibirás tus paquetes.</p>
        </div>

        <div className="mt-6">
          {renderStepContent(
            "h-12 w-full rounded-md border border-gray-300 bg-white px-3",
            "h-24 w-full rounded-md border border-gray-300 px-3 py-2"
          )}
          {error && <div className="mt-4 text-sm font-semibold text-red-600">{error}</div>}
          {accountExists && (
            <Link
              href={signInUrl}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-amazon_blue bg-white px-4 text-sm font-black text-amazon_blue hover:bg-amazon_blue hover:text-white"
            >
              Iniciar sesión con este correo
            </Link>
          )}
          {renderStepActions()}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <span>Ya tienes cuenta?</span>{" "}
          <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-amazon_blue hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>

      <div className="hidden w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow md:grid md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-gray-100 bg-gray-50 p-8">
          <div className="rounded-full bg-white p-1 shadow-md ring-2 ring-white/60 w-fit">
            <Image src={require("@/images/logo.jpg")} alt="Logo Rossy Resina" width={64} height={64} className="rounded-full object-contain" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-amazon_blue">Crear cuenta</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Registra tu cuenta y la dirección donde recibirás tus paquetes.</p>

          <div className="mt-8 space-y-2">
            {steps.map((item, index) => {
              const active = item === step;
              const done = currentStepIndex > index || step === "password";
              return (
                <div
                  key={item}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    active ? "bg-white text-gray-950 shadow-sm" : "text-gray-500"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      active || done ? "bg-amazon_blue text-white" : "bg-white text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-semibold">{stepMeta[item].label}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="p-8">
          <div>
            <p className="rr-type-label text-amazon_blue">
              {step === "method" ? "Inicio" : `Paso ${currentStepIndex + 1} de ${steps.length}`}
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-950">{stepMeta[step].title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{stepMeta[step].helper}</p>
          </div>

          <div className="mt-7 max-w-xl">
            {renderStepContent(
              "h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-base",
              "h-28 w-full rounded-md border border-gray-300 px-4 py-3 text-base"
            )}
            {error && <div className="mt-4 text-sm font-semibold text-red-600">{error}</div>}
            {accountExists && (
              <Link
                href={signInUrl}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-amazon_blue bg-white px-4 text-sm font-black text-amazon_blue hover:bg-amazon_blue hover:text-white"
              >
                Iniciar sesión con este correo
              </Link>
            )}
            {renderStepActions()}
          </div>

        <div className="mt-8 text-sm text-gray-600">
          <span>Ya tienes cuenta?</span>{" "}
          <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-amazon_blue hover:underline">
            Inicia sesión
          </Link>
        </div>
        </section>
      </div>
    </div>
  );
}

function StepPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-black text-gray-950">{title}</h2>
      {children}
    </div>
  );
}
