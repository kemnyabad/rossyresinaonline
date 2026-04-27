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
  const pageTransitionStyle = { animation: "rrPageEnter 0.4s ease-out both" } as const;

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const role = (clientSession?.user as any)?.role;
    setIsAdmin(role === "ADMIN");
  }, [clientSession]);

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

    fixNode(document.body);
    document.querySelectorAll("*").forEach((el) => fixElementAttrs(el));

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
          const t = m.target as Text;
          const next = fixText(t.nodeValue || "");
          if (next !== t.nodeValue) t.nodeValue = next;
        }
        if (m.type === "attributes" && m.target instanceof Element) fixElementAttrs(m.target);
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) {
              const t = n as Text;
              const next = fixText(t.nodeValue || "");
              if (next !== t.nodeValue) t.nodeValue = next;
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

  const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=rossyresina2025");
  const showMaintenance = MAINTENANCE && !isAdminRoute && !isPreview && !isAdmin;

  if (status === "loading") {
    return <div className="bg-white h-screen w-screen" />;
  }

  if (showMaintenance) {
    return <MaintenancePage />;
  }

  const content = (
    <div className="font-bodyFont">
      <Head>
        <title>Rossy Resina</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
    <PersistGate persistor={persistor} loading={null}>{content}</PersistGate>
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
