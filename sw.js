// =============================================
// Service Worker – Bildungswege BW
// Version: 1.0
// =============================================

const CACHE_NAME = 'bildungswege-bw-v1';

// Alle Dateien die offline verfügbar sein sollen
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// ---- INSTALL: Cache befüllen ----
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Cache wird befüllt');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Sofort aktivieren, nicht auf alten SW warten
  self.skipWaiting();
});

// ---- ACTIVATE: Alte Caches löschen ----
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            console.log('[SW] Alter Cache wird gelöscht:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Sofort alle offenen Tabs übernehmen
  self.clients.claim();
});

// ---- FETCH: Cache-first Strategie ----
// Zuerst aus dem Cache laden, bei Misserfolg Netzwerk versuchen
self.addEventListener('fetch', function(event) {
  // Nur GET-Anfragen behandeln
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Aus Cache laden
        return cachedResponse;
      }
      // Nicht im Cache: Netzwerk versuchen
      return fetch(event.request).then(function(networkResponse) {
        // Gültige Antwort im Cache speichern
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
        // Offline und nicht im Cache: Fallback auf index.html
        return caches.match('/index.html');
      });
    })
  );
});
