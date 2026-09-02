# App Rossy Resina para Play Store

La tienda ya funciona como PWA: usa `site.webmanifest`, `public/sw.js` y refresca productos desde `/api/products` sin cache. Eso permite que los cambios hechos en el panel admin aparezcan en la app publicada sin subir una nueva version a Play Store.

La web normal y la app comparten el mismo backend y catalogo, pero el comportamiento de app se activa solo cuando se abre desde `/?source=pwa`, `/?source=playstore` o en modo instalado. En navegador web normal, el service worker no entrega paginas cacheadas ni cambia la navegacion.

## Flujo recomendado

1. Publica la web en produccion con HTTPS.
2. Define `NEXT_PUBLIC_SITE_URL` con el dominio final.
3. Verifica en Chrome DevTools > Application que el manifest y el service worker esten activos abriendo `/?source=pwa`.
4. Genera el paquete Android con Trusted Web Activity usando Bubblewrap:

```powershell
npx @bubblewrap/cli init --manifest https://TU-DOMINIO/site.webmanifest
npx @bubblewrap/cli build
```

5. Sube el `.aab` generado a Play Console.
6. Configura Digital Asset Links en `public/.well-known/assetlinks.json` con el package name y el SHA-256 de la firma de Play Console.

## Actualizacion de productos

Los productos se leen desde Prisma por `/api/products` con `Cache-Control: no-store`. Las paginas principales refrescan el catalogo cada 15 segundos, al volver a enfocar la app y al regresar desde segundo plano.

Para cambiar productos no necesitas publicar otra version de Android: entra al admin, crea/edita/elimina el producto y la app lo toma desde la API.

## Separacion web/app

- Web normal: entra por `/` y navega siempre contra red.
- App Play Store/PWA: entra por `/?source=pwa` y puede usar shell cacheado si el dispositivo queda sin conexion.
- API y productos: nunca se cachean en el service worker.
- Cambios de codigo: requieren deploy web; la app TWA los ve al cargar la web.
- Cambios de productos: no requieren deploy ni nueva version Android.
