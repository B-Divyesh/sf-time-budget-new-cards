/* This file is emitted as /sw.js by vite.config.ts. Do not register it directly. */
const VERSION = '__BUILD_ID__';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = __PRECACHE__;
const cachedResponse = (request) => caches.match(request, { ignoreVary: true });

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // This intentionally remains uncached so the UI can distinguish a real
  // connection from a successful service-worker response.
  if (url.pathname === '/online-check.txt') {
    event.respondWith(fetch(event.request).catch(() => new Response('', { headers: { 'X-Study-Tape-Offline': '1' } })));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => (await cachedResponse(event.request)) || (await cachedResponse('/index.html')) || cachedResponse('/offline.html'))
    );
    return;
  }

  event.respondWith(
    cachedResponse(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(RUNTIME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
