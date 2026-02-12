import RootLayout from "@/components/RootLayout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";
 
import { useEffect, useState } from "react";
import Head from "next/head";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [routeLoading, setRouteLoading] = useState(false);
  useEffect(() => {
    setRouteLoading(false);
  }, []);
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <SessionProvider session={session}>
          <div className="font-bodyFont">
            <Head>
              <title>Rossy Resina</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            
            <RootLayout>
              <div className="rr-page bg-gray-50 min-h-screen">
                <Component {...pageProps} />
              </div>
            </RootLayout>
          </div>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
