import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSafeCallbackUrl = () => {
    const raw = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/";
    try {
      const url = new URL(raw, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
      if (url.pathname === "/sign-in" || url.pathname.startsWith("/api/auth")) return "/";
      return `${url.pathname}${url.search}${url.hash}` || "/";
    } catch {
      return raw.startsWith("/sign-in") ? "/" : raw || "/";
    }
  };

  useEffect(() => {
    // Evita redireccionar autom?ticamente para que el usuario pueda ver el formulario.
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-100 to-transparent">
      <Head>
        <title>Iniciar sesi?n  -  Rossy Resina</title>
        <meta name="description" content="Accede a tu cuenta para guardar favoritos y realizar compras." />
      </Head>
      <div className="w-full max-w-md bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-1 shadow-md ring-2 ring-white/60">
            <Image src={require("@/images/logo.jpg")} alt="Logo Rossy Resina" width={64} height={64} className="rounded-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-amazon_blue">
            {mode === "login" ? "Bienvenida/o a Rossy Resina" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {mode === "login"
              ? "Inicia sesi?n para comentar y tener tu perfil."
              : "Registra tu cuenta para comentar y crear tu portafolio."}
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <button
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-full border ${mode === "login" ? "bg-amazon_blue text-white border-amazon_blue" : "border-gray-300"}`}
            >
              Iniciar sesi?n
            </button>
            <button
              onClick={() => setMode("register")}
              className={`px-4 py-2 rounded-full border ${mode === "register" ? "bg-amazon_blue text-white border-amazon_blue" : "border-gray-300"}`}
            >
              Registrarme
            </button>
          </div>

          <div className="grid gap-2">
            {mode === "register" && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-700">
                Para registrarte con correo necesitamos tus datos de envio.
                <Link href="/register" className="mt-3 inline-flex rounded-md bg-amazon_blue px-4 py-2 font-semibold text-white hover:brightness-95">
                  Crear cuenta con correo
                </Link>
              </div>
            )}
            {mode === "login" && (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contrasea"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {error && <div className="text-sm text-red-600">{error}</div>}
                <button
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                    const cb = getSafeCallbackUrl();
                    await signIn("credentials", { email, password, callbackUrl: cb });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black"
                >
                  {loading ? "Procesando..." : "Ingresar"}
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => signIn("google", { callbackUrl: getSafeCallbackUrl() })}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            <FcGoogle className="h-5 w-5" />
            Continuar con Google
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Al continuar aceptas nuestros <Link href="/terms" className="text-amazon_blue hover:underline">trminos</Link> y <Link href="/privacy" className="text-amazon_blue hover:underline">privacidad</Link>.
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === "login" ? "No tienes cuenta? Usa Registrarme arriba." : "Ya tienes cuenta? Usa Iniciar sesi?n arriba."}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
            Volver al inicio
          </Link>
        </div>

        {session && (
          <div className="mt-6 text-center">
            <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-amazon_blue">Cerrar sesi?n</button>
          </div>
        )}
      </div>
    </div>
  );
}
