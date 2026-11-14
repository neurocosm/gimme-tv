/**
 * Gimme TV - Service Worker
 * Conforming strictly to Section 1 & Section 5 of Project Architecture Guide
 * Zero Browser Data Hoarding: Only shell files cached.
 * Zero Image/API caching (network-only with cache: 'no-store') to prevent TV storage/memory degradation.
 */

const BUILD_VERSION = 'v1.11132026.2208';
const SHELL_CACHE = `gimme-tv-shell-${BUILD_VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/src/main.js',
  '/manifest.json',
  '/local_art_manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      // Clean up outdated caches
      return caches.keys().then((keys) =>
        Promise.all(
          keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))
        )
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Let browser handle external requests/images natively (zero SW caching or proxy overhead)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Always fetch version.json live without caching
  if (url.pathname === '/version.json') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // 2. Shell assets: Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(SHELL_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => cached || Promise.reject('offline'));
      })
  );
});
