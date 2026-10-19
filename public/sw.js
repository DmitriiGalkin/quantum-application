const CACHE_NAME = 'quantum-pwa-v4';

const STATIC_ASSETS = ['/', '/manifest.webmanifest', '/brand-mark.svg', '/icons/192.png', '/icons/512.png', '/icons/maskable-512.png', '/fonts/nunito.css', '/fonts/nunito-800.ttf'];

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

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let payload = {};
    try { payload = event.data?.json() || {}; } catch { payload = {}; }
    await self.registration.showNotification(payload.title || 'Quantum', {
      body: payload.body || 'Есть новые сообщения или важные изменения',
      icon: '/icons/192.png', badge: '/icons/192.png', tag: payload.tag || 'quantum',
      data: { url: typeof payload.url === 'string' && payload.url.startsWith('/') && !payload.url.startsWith('//') ? payload.url : '/chats' },
    });
    if (navigator.setAppBadge) await navigator.setAppBadge();
  })());
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const url = new URL(event.notification.data?.url || '/chats',self.location.origin);
    if (url.origin !== self.location.origin) return;
    const windows = await self.clients.matchAll({ type:'window',includeUncontrolled:true });
    const existing = windows.find(client => new URL(client.url).origin === url.origin);
    if (existing) { await existing.navigate(url.href); await existing.focus(); }
    else await self.clients.openWindow(url.href);
  })());
});
