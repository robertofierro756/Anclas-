const CACHE_NAME = "aloha-limpieza-vercel-v1";
const ARCHIVOS_APP = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_APP)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: red primero para los recursos de la app (para tomar cambios),
// con respaldo en caché cuando no hay conexión. Cache-first para CDNs externos.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const esMismoOrigen = new URL(req.url).origin === self.location.origin;

  if (esMismoOrigen) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
  } else {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copia = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
            return res;
          })
      )
    );
  }
});
