/**
 * Gimme TV - Service Worker
 * Conforming strictly to Section 1 & Section 5 of Project Architecture Guide
 * Zero Browser Data Hoarding: Only minimal static PWA shell icons/manifest cached.
 * Navigation requests pass through natively without Request mutation so auth proxies,
 * redirects, and PWA standalone launches on Smart TVs, tablets, and phones never loop.
 */

const BUILD_VERSION = 'v1.11282026.0510';
const SHELL_CACHE = `gimme-tv-shell-${BUILD_VERSION}`;

const SHELL_ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  // Activate silently right away so no worker ever sits stuck in reg.waiting across tabs/PWAs
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_ASSETS.map(async (asset) => {
          try {
            const res = await fetch(asset, { cache: 'no-cache', credentials: 'same-origin' });
            if (res && res.ok && res.status === 200 && !res.redirected) {
              await cache.put(asset, res);
            }
          } catch (_err) {
            // Never fail installation on transient asset fetch errors
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

  // 1. Let browser handle all external artwork/API requests natively
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Navigation requests: let browser perform native top-level document fetches directly
  //    so Smart TVs, tablets, and PWAs never get stuck behind a stale Service Worker HTML cache
  if (event.request.mode === 'navigate') {
    return;
  }

  // Compute path relative to SW registration scope (works at "/" or "/gimme-tv/")
  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  const relPath =
    scopePath && url.pathname.startsWith(scopePath)
      ? url.pathname.slice(scopePath.length) || '/'
      : url.pathname;

  // 3. Never intercept or cache version beacon, SW script, API proxy, dev source files, or manifest
  if (
    relPath === '/version.json' ||
    relPath === '/sw.js' ||
    relPath === '/manifest.json' ||
    relPath === '/style.css' ||
    relPath.startsWith('/src/') ||
    relPath.startsWith('/vendor/') ||
    relPath.startsWith('/api/') ||
    relPath.startsWith('/@')
  ) {
    return;
  }

  // 4. Static hashed production bundles (/assets/*) and launcher icons (/icons/*, /apple-touch-icon.png)
  if (
    relPath.startsWith('/assets/') ||
    relPath.startsWith('/icons/') ||
    relPath === '/apple-touch-icon.png'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok &&
            networkResponse.status === 200 &&
            !networkResponse.redirected
          ) {
            const contentType = networkResponse.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) {
              const responseToCache = networkResponse.clone();
              caches.open(SHELL_CACHE).then((cache) => {
                cache.put(event.request, responseToCache).catch(() => {});
              });
            }
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
