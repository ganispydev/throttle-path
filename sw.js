const CACHE_NAME = "throttle-path-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./topics.html",
  "./about.html",
  "./article.html",
  "./404.html",
  "./offline.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/utils.js",
  "./js/loader.js",
  "./assets/logo.png",
  "./assets/logo-192.png",
  "./assets/logo-512.png",
  "./data/posts.json"
];

// Install Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate and clear old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch with fallback to cache / offline / 404
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Cache new requests in background
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => {
        // If request exists in cache, serve it
        return caches.match(event.request).then(cachedRes => {
          if (cachedRes) return cachedRes;

          // If it's a navigation request → offline.html
          if (event.request.mode === "navigate") {
            return caches.match("./offline.html");
          }
          // If not found, fallback to 404
          return caches.match("./404.html");
        });
      })
  );
});