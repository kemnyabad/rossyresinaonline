import RootLayout from "@/components/RootLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";

import Head from "next/head";
import { useRouter } from "next/router";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
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

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <SessionProvider session={session}>
          <div className="font-bodyFont">
            <Head>
              <title>Rossy Resina</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <style>{`
                @keyframes rrPageEnter {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                  .rr-page {
                    animation: none !important;
                  }
                }
              `}</style>
            </Head>
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
          </div>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
