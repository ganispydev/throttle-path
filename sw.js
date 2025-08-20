// Daily cache version to flush stale assets
const CACHE_VERSION = new Date().toISOString().slice(0,10); // YYYY-MM-DD
const CACHE_NAME = `throttle-path-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./topics.html",
  "./article.html",
  "./404.html",
  "./header.html",
  "./footer.html",
  "./manifest.webmanifest",
  "./assets/logo-192-v2.png",
  "./assets/logo-512-v2.png",
  "./css/styles.css",
  "./js/app.js",
  "./js/topics.js",
  "./js/article.js",
  "./js/loader.js",
  "./js/utils.js",
  "./data/posts.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Don't cache cache-busted requests (?v=...)
  if (url.searchParams.has("v")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Network-first for HTML / partials / manifest to keep fresh UI
  if (url.pathname.endsWith(".html") || url.pathname.endsWith(".webmanifest")) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        return res;
      });
    })
  );
});