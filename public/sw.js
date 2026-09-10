const CACHE_NAME = "rossy-resina-shell-v1";
const SHELL_ASSETS = [
  "/",
  "/productos",
  "/site.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
];
const APP_CLIENTS = new Set();

const isAppLaunchUrl = (url) => {
  const source = url.searchParams.get("source");
  return source === "pwa" || source === "playstore";
};

const isAppRequest = async (event, url) => {
  if (isAppLaunchUrl(url)) return true;
  if (event.clientId && APP_CLIENTS.has(event.clientId)) return true;
  if (!event.clientId || !self.clients?.get) return false;

  try {
    const client = await self.clients.get(event.clientId);
    if (!client?.url) return false;
    const clientUrl = new URL(client.url);
    return isAppLaunchUrl(clientUrl) || APP_CLIENTS.has(client.id);
  } catch {
    return false;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "ROSSY_APP_MODE") return;
  if (event.source?.id) APP_CLIENTS.add(event.source.id);
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/")) return;

  event.respondWith(
    (async () => {
      const appRequest = await isAppRequest(event, url);
      if (!appRequest) return fetch(request);

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")));
    })()
  );
});
