import RootLayout from "@/components/RootLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import TopBar from "@/components/header/TopBar";
import MaintenancePage from "@/components/MaintenancePage";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function AppContent({
  Component,
  pageProps,
  session,
}: {
  Component: any;
  pageProps: any;
  session: any;
}) {
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const router = useRouter();
  const { data: clientSession, status } = useSession();

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isRifasRoute = router.pathname.startsWith("/rifas") || router.pathname.startsWith("/rifa/");
  const isCapacitaciones =
    router.pathname.startsWith("/capacitaciones") ||
    router.pathname.startsWith("/comunidad") ||
    router.pathname.startsWith("/suscriptores") ||
    isRifasRoute ||
    router.pathname === "/suscripcion" ||
    router.pathname === "/sign-in" ||
    router.pathname === "/register";

  const pageShellClass = "rr-page min-h-screen";
  const fixedHeaderPageShellClass = "min-h-screen";
  const pageTransitionStyle = { animation: "rrPageEnter 0.22s ease-out both" } as const;

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const role = (clientSession?.user as any)?.role;
    setIsAdmin(role === "ADMIN");
  }, [clientSession]);

  useEffect(() => {
    let timer: number | null = null;
    const start = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setRouteLoading(true), 120);
    };
    const stop = () => {
      if (timer) window.clearTimeout(timer);
      timer = null;
      setRouteLoading(false);
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", stop);
    router.events.on("routeChangeError", stop);
    return () => {
      if (timer) window.clearTimeout(timer);
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", stop);
      router.events.off("routeChangeError", stop);
    };
  }, [router.events]);

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
    }).catch(() => {});
  }, [isClient, isAdminRoute, router.asPath, session]);

  useEffect(() => {
    if (!isClient) return;

    const rules: Array<[RegExp, string]> = [
      [/Env[?]os/gi, "Envíos"],
      [/Env[?]o/gi, "Envío"],
      [/r[?]pido/gi, "rápido"],
      [/sesi[?]n/gi, "sesión"],
      [/m[?]s/gi, "más"],
      [/A[?]n/gi, "Aún"],
      [/a[?]n/gi, "aún"],
      [/V[?]lido/gi, "Válido"],
      [/Participaci[?]n/gi, "Participación"],
      [/atenci[?]n/gi, "atención"],
      [/Per[?]/gi, "Perú"],
      [/rel[?]mpago/gi, "relámpago"],
      [/cat[?]logo/gi, "catálogo"],
      [/Categor[?]a/gi, "Categoría"],
      [/categor[?]a/gi, "categoría"],
      [/rese[?]a/gi, "reseña"],
      [/rese[?]as/gi, "reseñas"],
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
        const t = node as Text;
        const next = fixText(t.nodeValue || "");
        if (next !== t.nodeValue) t.nodeValue = next;
        node = walker.nextNode();
      }
    };

    const fixElementAttrs = (el: Element) => {
      for (const attr of ["title", "placeholder", "aria-label", "alt"]) {
        const raw = el.getAttribute(attr);
        if (!raw) continue;
        const next = fixText(raw);
        if (next !== raw) el.setAttribute(attr, next);
      }
    };

    const run = () => {
      fixNode(document.body);
      document.querySelectorAll("*").forEach((el) => fixElementAttrs(el));
    };
    const idle = (window as any).requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle(run, { timeout: 1200 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(run, 250);
    return () => window.clearTimeout(timer);
  }, [isClient, router.asPath]);

  const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=rossyresina2025");
  const showMaintenance = MAINTENANCE && status !== "loading" && !isAdminRoute && !isPreview && !isAdmin;

  if (showMaintenance) {
    return <MaintenancePage />;
  }

  const content = (
    <div className="font-bodyFont">
      <Head>
        <title>Rossy Resina</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        className={`fixed left-0 top-0 z-[9999] h-1 bg-amazon_blue shadow-sm transition-all duration-300 ${
          routeLoading ? "w-2/3 opacity-100" : "w-full opacity-0"
        }`}
      />
      {isAdminRoute ? (
        <AdminLayout>
          <div key={router.asPath} className={pageShellClass} style={pageTransitionStyle}>
            <Component {...pageProps} />
          </div>
        </AdminLayout>
      ) : isCapacitaciones ? (
        <div
          key={router.asPath}
          className={isRifasRoute ? fixedHeaderPageShellClass : pageShellClass}
          style={isRifasRoute ? undefined : pageTransitionStyle}
        >
          <Component {...pageProps} />
        </div>
      ) : (
        <RootLayout>
          <div key={router.asPath} className={`${pageShellClass} bg-gray-50`} style={pageTransitionStyle}>
            <Component {...pageProps} />
          </div>
        </RootLayout>
      )}
    </div>
  );

  return isClient ? (
    <PersistGate persistor={persistor} loading={content}>{content}</PersistGate>
  ) : content;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <AppContent Component={Component} pageProps={pageProps} session={session} />
      </SessionProvider>
    </Provider>
  );
}
