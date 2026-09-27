// Service worker - JS/CSS always fresh; other assets network-first
const CACHE_NAME = 'diablo-web-v7.09';

// Activate immediately on install
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Take over the page immediately on activation
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName => cacheName.startsWith('diablo-web-') && cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

// fetch strategy
self.addEventListener('fetch', event => {
    const request = event.request;

    // onlyhandle GET request
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    const path = url.pathname;

// JS, CSS and HTML always fetch fresh from the server, no cache
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.html') || path.endsWith('/')) {
        event.respondWith(fetch(request, { cache: 'no-store' }));
        return;
    }

// Other assets use the default behavior
    event.respondWith(fetch(request));
});
