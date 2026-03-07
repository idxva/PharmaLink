const CACHE_NAME = 'pharmalink-v2';
const ASSETS = [
    '/PharmaLink/',
    '/PharmaLink/index.html',
    '/PharmaLink/style.css',
    '/PharmaLink/script.js',
    '/PharmaLink/manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Cache-first for static assets; let Firestore/CDN calls pass through
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
