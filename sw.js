const CACHE_NAME = 'throttlepath-v1';
const ASSETS = [
  './',
  './index.html',
  './about.html',
  './topics.html',
  './article.html',
  './404.html',
  './css/styles.css',
  './js/utils.js',
  './js/app.js',
  './js/article.js',
  './js/topics.js',
  './assets/logo.svg',
  './data/posts.json'
];

// ✅ Install event: cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ✅ Activate event: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// ✅ Fetch event with 404 + image caching
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(resp => {
        return resp || fetch(event.request).then(networkResp => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResp.clone());
            return networkResp;
          });
        }).catch(() => caches.match('./assets/logo.svg'));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) return resp;
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./404.html');
        }
      });
    })
  );
});
