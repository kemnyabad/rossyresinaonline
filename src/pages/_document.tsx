import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="application-name" content="Rossy Resina" />
        <meta name="apple-mobile-web-app-title" content="Rossy Resina" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#e4147f" />
      </Head>
      <body>
        {metaPixelId ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}


