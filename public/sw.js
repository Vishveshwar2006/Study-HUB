/**
 * Service Worker for Study HUB
 * Provides offline shell caching, asset fallback, and coordinates
 * with IndexedDB for offline study materials & course announcements.
 */

const CACHE_NAME = 'studyhub-app-v1';
const DYNAMIC_CACHE = 'studyhub-dynamic-v1';

// Static assets to precache for offline application shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching App Shell & Offline fallback assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some assets failed precaching:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy with cache fallback for HTML/scripts/API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or external extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Handle API calls with network first, fallback to offline error response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            error: 'Network unavailable. Displaying saved study materials & announcements from IndexedDB.',
          }),
          {
            status: 533,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // Standard static page / asset request strategy: Network-first, fallback to cache, fallback to /index.html
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Clone response to put in dynamic cache if valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Try matching request in cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation HTML requests, return cached index.html
        if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
          const indexCache = await caches.match('/index.html');
          if (indexCache) {
            return indexCache;
          }
        }

        return new Response('Offline - Material saved in IndexedDB available in App', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});

// Listen for client messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
