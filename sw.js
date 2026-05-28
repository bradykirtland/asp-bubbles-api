// Minimal service worker — required for PWA install. Caches the app shell so
// the app opens instantly and survives a flaky connection. API data is always
// fetched live (never cached).

const CACHE = "asp-bubbles-v20";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Never cache backend API calls — always go to the network.
  if (url.hostname.indexOf("railway.app") !== -1) return;
  if (url.hostname.indexOf("script.google.com") !== -1) return; // legacy fallback
  // App shell: serve from cache first, fall back to network.
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
