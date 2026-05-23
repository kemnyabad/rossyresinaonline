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
  const callbackUrl = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/checkout";

  const steps: RegisterStep[] = ["email", "name", "dni", "phone", "shipping", "password"];
  const currentStepIndex = steps.indexOf(step);

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

  const handleSubmit = async () => {
    setError(null);
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="h-12 w-full rounded-md border border-gray-300 px-3"
              />
            </StepPanel>
          )}

          {step === "name" && (
            <StepPanel title="Nombres">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                className="h-12 w-full rounded-md border border-gray-300 px-3"
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
                className="h-12 w-full rounded-md border border-gray-300 px-3"
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
                className="h-12 w-full rounded-md border border-gray-300 px-3"
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
                  className="h-12 w-full rounded-md border border-gray-300 px-3"
                />
                <select
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value === "OLVA" ? "OLVA" : "SHALOM")}
                  className="h-12 w-full rounded-md border border-gray-300 bg-white px-3"
                >
                  <option value="SHALOM">Recoger en agencia Shalom</option>
                  <option value="OLVA">Entrega a domicilio por Olva</option>
                </select>
                {shippingCarrier === "SHALOM" ? (
                  <input
                    value={shalomAgency}
                    onChange={(e) => setShalomAgency(e.target.value)}
                    placeholder="Agencia Shalom donde recogerás"
                    className="h-12 w-full rounded-md border border-gray-300 px-3"
                  />
                ) : (
                  <>
                    <input
                      value={olvaAddress}
                      onChange={(e) => setOlvaAddress(e.target.value)}
                      placeholder="Dirección exacta"
                      className="h-12 w-full rounded-md border border-gray-300 px-3"
                    />
                    <textarea
                      value={olvaReference}
                      onChange={(e) => setOlvaReference(e.target.value)}
                      placeholder="Referencia del domicilio"
                      className="h-24 w-full rounded-md border border-gray-300 px-3 py-2"
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
                  className="h-12 w-full rounded-md border border-gray-300 px-3"
                />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirmar contraseña"
                  className="h-12 w-full rounded-md border border-gray-300 px-3"
                />
              </div>
            </StepPanel>
          )}

          {error && <div className="mt-4 text-sm font-semibold text-red-600">{error}</div>}

          {step !== "method" && (
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  const prev = steps[currentStepIndex - 1];
                  if (prev) setStep(prev);
                  else setStep("method");
                }}
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
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <span>Ya tienes cuenta?</span>{" "}
          <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-amazon_blue hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>

      <div className="hidden w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow md:block">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-white p-1 shadow-md ring-2 ring-white/60">
            <Image src={require("@/images/logo.jpg")} alt="Logo Rossy Resina" width={64} height={64} className="rounded-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-amazon_blue">Crear cuenta</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Registra tu cuenta y la direccion donde recibiras tus paquetes.</p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            placeholder="DNI"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefono"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            value={locationLine}
            onChange={(e) => setLocationLine(e.target.value)}
            placeholder="Departamento - Provincia - Distrito"
            className="w-full rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
          />
          <select
            value={shippingCarrier}
            onChange={(e) => setShippingCarrier(e.target.value === "OLVA" ? "OLVA" : "SHALOM")}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 md:col-span-2"
          >
            <option value="SHALOM">Recoger en agencia Shalom</option>
            <option value="OLVA">Entrega a domicilio por Olva</option>
          </select>
          {shippingCarrier === "SHALOM" ? (
            <input
              value={shalomAgency}
              onChange={(e) => setShalomAgency(e.target.value)}
              placeholder="Agencia Shalom donde recogerás"
              className="w-full rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
            />
          ) : (
            <>
              <input
                value={olvaAddress}
                onChange={(e) => setOlvaAddress(e.target.value)}
                placeholder="Direccion exacta"
                className="w-full rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
              />
              <textarea
                value={olvaReference}
                onChange={(e) => setOlvaReference(e.target.value)}
                placeholder="Referencia del domicilio"
                className="w-full rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
              />
            </>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasena"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmar contrasena"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {error && <div className="text-sm text-red-600 md:col-span-2">{error}</div>}
          <button
            onClick={handleSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amazon_blue px-4 py-2 text-white hover:bg-amazon_yellow hover:text-black md:col-span-2"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <span>Ya tienes cuenta?</span>{" "}
          <Link href="/sign-in" className="text-amazon_blue hover:underline">
            Inicia sesión
          </Link>
        </div>
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
