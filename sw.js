// Service Worker con cache locale per apertura istantanea del launcher
// Prima apertura: scarica e cachea (~1 sec una tantum)
// Aperture successive: servito da cache (50-100ms) → redirect immediato

const CACHE = 'launcher-v3';
const CACHED = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then(c => c.addAll(CACHED))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Pulisci cache vecchie se aggiorni versione
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Cache-first: serve da cache se disponibile, altrimenti rete
    event.respondWith(
        caches.match(event.request).then(r => r || fetch(event.request))
    );
});
