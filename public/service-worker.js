const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/db.js',
    '/index.js',
    '/style.css',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './manifest.webmanifest'

];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) =>{
                console.log("files have been cached");
                return cache.addAll(FILES_TO_CACHE);
            })
            
    ).then(self.skipWaiting());
});


// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});
//fetch

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(DATA_CACHE_NAME).then((cached) => {
                if (cached) {
                    return cached;
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});
//   //adding even respond not sure about this one
evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
