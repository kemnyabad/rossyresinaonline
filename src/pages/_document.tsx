import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@200;300;400;500;600;700;800&family=Montserrat:wght@400;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#6E2CA1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}


