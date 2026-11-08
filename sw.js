/**
 * Prophetic Timeline - Service Worker (Offline Cache)
 */

const CACHE_NAME = "prophetic-timeline-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/main.css",
  "./css/timeline.css",
  "./css/calendar.css",
  "./css/visualizers.css",
  "./js/app.js",
  "./js/core/calendar-engine.js",
  "./js/core/event-store.js",
  "./js/core/i18n.js",
  "./js/i18n/ms.js",
  "./js/i18n/en.js",
  "./js/i18n/ar.js",
  "./js/views/timeline-view.js",
  "./js/views/calendar-month-view.js",
  "./js/views/calendar-year-view.js",
  "./js/visualizers/eclipse-sim.js",
  "./js/visualizers/conjunction-sim.js",
  "./js/visualizers/day-calculator.js",
  "./data/events.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request);
    })
  );
});
