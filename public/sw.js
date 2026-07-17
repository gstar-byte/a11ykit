const CACHE_VERSION = "a11ykit-v1";
const CORE_ASSETS = [
  "/",
  "/tools",
  "/about",
  "/privacy",
  "/terms",
  "/favicon.svg",
  "/site.webmanifest",
  "/og-image.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll(CORE_ASSETS).catch(() => {
        // If any core asset fails, continue anyway
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests (OpenAI API, CORS proxies, Google Analytics)
  if (url.origin !== self.location.origin) return;

  // Skip Google Analytics requests
  if (url.hostname.includes("googletagmanager") || url.hostname.includes("google-analytics")) return;

  // Stale-while-revalidate for all same-origin GET requests
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);

      const fetchPromise = fetch(request)
        .then((response) => {
          // Only cache valid responses
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Network failed — return cached version if available
          return cached;
        });

      // Return cached version immediately if available, otherwise wait for network
      return cached || fetchPromise;
    })
  );
});
