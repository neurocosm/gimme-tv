/**
 * Gimme TV - Service Worker
 * Conforming strictly to Section 1 & Section 5 of Project Architecture Guide
 * Zero Browser Data Hoarding: Only core PWA shell files cached.
 * Zero Image/API caching (network-only with cache: 'no-store') to prevent TV storage/memory degradation.
 */

const BUILD_VERSION = 'v1.11192026.2105';
const SHELL_CACHE = `gimme-tv-shell-${BUILD_VERSION}`;

// Only precache static assets guaranteed to exist in both dev and production builds
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_ASSETS.map(async (asset) => {
          try {
            const res = await fetch(new Request(asset, { cache: 'no-cache' }));
            if (res && res.ok && res.status === 200) {
              await cache.put(asset, res);
            }
          } catch (_err) {
            // Never fail SW installation if a single optional shell asset is momentarily unavailable
          }
        })
      )
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Let browser handle external requests/images natively (zero SW caching or proxy overhead)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Completely bypass version beacon, service worker script, API proxy, and Vite dev internals
  if (
    url.pathname === '/version.json' ||
    url.pathname === '/sw.js' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('_u')
  ) {
    return;
  }

  // 3. Shell assets & navigation: Network-first with cache: 'no-cache' so updates never replay stale HTTP cache
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
          const contentType = networkResponse.headers.get('content-type') || '';
          const isAssetExt = /\.(js|mjs|css|json|png|svg|ico|webp)$/i.test(url.pathname);
          const isUnexpectedHtml = isAssetExt && contentType.includes('text/html');

          if (!isUnexpectedHtml) {
            const responseToCache = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            });
          }
        }
        return networkResponse;
      })
      .catch(() => {
        return caches
          .match(event.request)
          .then((cached) => cached || Promise.reject(new Error('offline')));
      })
  );
});
