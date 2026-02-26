// =============================================
// Service Worker – Bildungswege BW
// Version: 1.1
// =============================================

const CACHE_NAME = 'bildungswege-bw-v2';
const BASE_PATH = '/HPMS_App_v1/';

const FILES_TO_CACHE = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest',
  BASE_PATH + 'icon-192.png',
  BASE_PATH + 'icon-512.png'
];

// ---- INSTALL ----
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Cache wird befüllt');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ---- ACTIVATE: Alte Caches löschen ----
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            console.log('[SW] Alter Cache gelöscht:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ---- FETCH: Cache-first ----
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(function(networkResponse) {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Offline-Fallback
        return caches.match(BASE_PATH + 'index.html');
      });
    })
  );
});

{
  "name": "Bildungswege Baden-Württemberg",
  "short_name": "Bildungswege BW",
  "description": "Finde deinen Weg zum Wunschabschluss – individuell und übersichtlich",
  "start_url": "/HPMS_App_v1/",
  "scope": "/HPMS_App_v1/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F5F7FA",
  "theme_color": "#0B7BB3",
  "lang": "de",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
