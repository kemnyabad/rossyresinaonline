import RootLayout from "@/components/RootLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import TopBar from "@/components/header/TopBar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/admin");
  const isCapacitaciones =
    router.pathname.startsWith("/capacitaciones") ||
    router.pathname.startsWith("/comunidad") ||
    router.pathname.startsWith("/suscriptores") ||
    router.pathname === "/suscripcion" ||
    router.pathname === "/sign-in" ||
    router.pathname === "/register";

  const pageShellClass = "rr-page min-h-screen";
  const pageTransitionStyle = { animation: "rrPageEnter .22s ease-out both" } as const;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (isAdminRoute) return;
    const path = String(router.asPath || "/");
    if (path.startsWith("/admin") || path.startsWith("/api")) return;

    const key = "rr_visitor_id";
    let visitorId = "";
    try {
      visitorId = String(localStorage.getItem(key) || "").trim();
      if (!visitorId) {
        const rnd = Math.random().toString(36).slice(2, 10);
        visitorId = `v-${Date.now()}-${rnd}`;
        localStorage.setItem(key, visitorId);
      }
    } catch {
      visitorId = `v-${Date.now()}`;
    }

    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        visitorId,
        userEmail: String((session as any)?.user?.email || ""),
        userName: String((session as any)?.user?.name || ""),
      }),
      keepalive: true,
    }).catch(() => {
      // Silencioso: no afecta UX.
    });
  }, [isClient, isAdminRoute, router.asPath, session]);

  useEffect(() => {
    if (!isClient) return;

    const rules: Array<[RegExp, string]> = [
      [/Env[?�]os/gi, "Envíos"],
      [/Env[?�]o/gi, "Envío"],
      [/r[?�]pido/gi, "rápido"],
      [/sesi[?�]n/gi, "sesión"],
      [/m[?�]s/gi, "más"],
      [/A[?�]n/gi, "Aún"],
      [/a[?�]n/gi, "aún"],
      [/V[?�]lido/gi, "Válido"],
      [/Participaci[?�]n/gi, "Participación"],
      [/atenci[?�]n/gi, "atención"],
      [/Per[?�]/gi, "Perú"],
      [/rel[?�]mpago/gi, "relámpago"],
      [/cat[?�]logo/gi, "catálogo"],
      [/Categor[?�]a/gi, "Categoría"],
      [/categor[?�]a/gi, "categoría"],
      [/rese[?�]a/gi, "reseña"],
      [/rese[?�]as/gi, "reseñas"],
    ];

    const fixText = (value: string): string => {
      let out = String(value || "");
      for (const [rx, to] of rules) out = out.replace(rx, to);
      return out;
    };

    const fixNode = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const textNode = node as Text;
        const nextValue = fixText(textNode.nodeValue || "");
        if (nextValue !== textNode.nodeValue) textNode.nodeValue = nextValue;
        node = walker.nextNode();
      }
    };

    const fixElementAttrs = (el: Element) => {
      const attrs = ["title", "placeholder", "aria-label", "alt"];
      for (const attr of attrs) {
        const raw = el.getAttribute(attr);
        if (!raw) continue;
        const nextValue = fixText(raw);
        if (nextValue !== raw) el.setAttribute(attr, nextValue);
      }
    };

    fixNode(document.body);
    document.querySelectorAll("*").forEach((el) => fixElementAttrs(el));

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
          const t = m.target as Text;
          const nextValue = fixText(t.nodeValue || "");
          if (nextValue !== t.nodeValue) t.nodeValue = nextValue;
        }
        if (m.type === "attributes" && m.target instanceof Element) {
          fixElementAttrs(m.target);
        }
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) {
              const t = n as Text;
              const nextValue = fixText(t.nodeValue || "");
              if (nextValue !== t.nodeValue) t.nodeValue = nextValue;
            } else if (n instanceof Element) {
              fixNode(n);
              fixElementAttrs(n);
              n.querySelectorAll("*").forEach((el) => fixElementAttrs(el));
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "placeholder", "aria-label", "alt"],
    });

    return () => observer.disconnect();
  }, [isClient]);

  const MAINTENANCE = false;
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=rossyresina2025");

  const appContent = (
    <SessionProvider session={session}>
      <div className="font-bodyFont">
        <Head>
          <title>Rossy Resina</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        {MAINTENANCE && !isAdminRoute && !isPreview ? (
          <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0533, #3b0764, #6b21a8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
              @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
            `}</style>
            <div style={{ fontSize: 72, animation: "float 3s ease-in-out infinite" }}>🔧</div>
            <div style={{ marginTop: 24, width: 56, height: 56, border: "5px solid rgba(255,255,255,0.2)", borderTop: "5px solid #e91e8c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <h1 style={{ color: "#fff", fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "24px 0 12px", letterSpacing: -1 }}>Web en Mantenimiento</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, fontWeight: 600, margin: "0 0 8px", animation: "pulse 2s ease-in-out infinite" }}>Estamos presentando problemas en el servicio</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, margin: 0 }}>La web se mantendra indispuesta hasta el <strong style={{ color: "#e91e8c" }}>miercoles 8 de abril</strong></p>
            <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
              {[0,1,2,3,4].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e91e8c", animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 40 }}>Rossy Resina &copy; 2025</p>
          </div>
        ) : (
          <>
            {!isAdminRoute && <TopBar />}
            {isAdminRoute ? (
              <AdminLayout>
                <div key={router.asPath} className={pageShellClass} style={pageTransitionStyle}>
                  <Component {...pageProps} />
                </div>
              </AdminLayout>
            ) : isCapacitaciones ? (
              <div key={router.asPath} className={pageShellClass} style={pageTransitionStyle}>
                <Component {...pageProps} />
              </div>
            ) : (
              <RootLayout>
                <div key={router.asPath} className={`${pageShellClass} bg-gray-50`} style={pageTransitionStyle}>
                  <Component {...pageProps} />
                </div>
              </RootLayout>
            )}
          </>
        )}
      </div>
    </SessionProvider>
  );

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate persistor={persistor} loading={null}>
          {appContent}
        </PersistGate>
      ) : (
        appContent
      )}
    </Provider>
  );
}
