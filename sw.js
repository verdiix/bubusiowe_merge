// Cache-first dla działania offline
const CACHE = 'fruit-merge-v2'; // <- podbiłem wersję po zmianach
const APP_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  // Ikony (dodaj jeśli umieścisz pliki)
  // '/icons/icon-192.png',
  // '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_ASSETS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys
      .filter(k => k !== CACHE)
      .map(k => caches.delete(k))
    )).then(self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
