import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AdminSignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const cb = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/admin";
      router.replace(cb);
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Head>
        <title>Acceso administrador â€” Rossy Resina</title>
        <meta name="description" content="Accede al panel administrativo de Rossy Resina." />
      </Head>
      <div className="w-full max-w-md bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-1 shadow-md ring-2 ring-white/60">
            <Image
              src={require("@/images/logo.jpg")}
              alt="Logo Rossy Resina"
              width={64}
              height={64}
              className="rounded-full object-contain"
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Acceso administrador</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Inicia sesion para gestionar productos, precios y contenido.
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="grid gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contrasena"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9.9 5.1A11 11 0 0 1 12 5c5 0 9.3 3.1 11 7-1 2.3-2.7 4.2-4.9 5.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6.1 6.1C4.1 7.3 2.6 9 1 12c1.7 3.9 6 7 11 7 1.1 0 2.2-.1 3.2-.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M1 12c1.7-4 6-7 11-7s9.3 3 11 7c-1.7 4-6 7-11 7s-9.3-3-11-7Z" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                setErrorMsg(null);
                setDebugMsg(null);
                const cb =
                  typeof router.query.callbackUrl === "string"
                    ? router.query.callbackUrl
                    : "/admin";
                try {
                  const res = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl: cb,
                  });
                  if (res?.ok) {
                    const sessionRes = await fetch("/api/auth/session");
                    const sessionJson = await sessionRes.json();
                    if (sessionJson?.user?.role === "ADMIN") {
                      router.replace(res.url || cb);
                      return;
                    }
                    setDebugMsg("SesiÃ³n creada, pero sin rol ADMIN.");
                    setErrorMsg("Tu usuario no tiene permisos de administrador.");
                  } else {
                    setDebugMsg(`Error de login: ${res?.error || "desconocido"} (${res?.status || "?"})`);
                    setErrorMsg("Credenciales invÃ¡lidas para el panel admin.");
                  }
                } catch (err: any) {
                  setDebugMsg(`ExcepciÃ³n: ${err?.message || String(err)}`);
                  setErrorMsg("No se pudo iniciar sesiÃ³n.");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
            >
              {loading ? "Ingresando..." : "Ingresar al panel"}
            </button>
          </div>
          {errorMsg && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errorMsg}
            </div>
          )}
          {debugMsg && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {debugMsg}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
