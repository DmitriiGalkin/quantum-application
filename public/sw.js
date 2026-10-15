const CACHE_NAME = 'quantum-pwa-v3';

const STATIC_ASSETS = ['/', '/manifest.webmanifest', '/icons/192.png', '/icons/512.png', '/fonts/nunito.css', '/fonts/nunito-800.ttf'];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('quantum-pwa-') && cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(fetch(event.request).catch(async () => (await caches.match(event.request)) ?? Response.error()));
});
