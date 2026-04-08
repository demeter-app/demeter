const CACHE_NAME = 'demeter-v1';
const ASSETS = [
'/',
'/index.html',
'/manifest.json',
'/icon-192.png',
'/icon-512.png'
];

self.addEventListener('install', function(e) {
e.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
return cache.addAll(ASSETS);
})
);
self.skipWaiting();
});

self.addEventListener('activate', function(e) {
e.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(
keys.filter(function(k) { return k !== CACHE_NAME; })
.map(function(k) { return caches.delete(k); })
);
})
);
self.clients.claim();
});

self.addEventListener('fetch', function(e) {
if (e.request.url.indexOf('supabase.co') !== -1 ||
e.request.url.indexOf('googleapis') !== -1 ||
e.request.url.indexOf('jsdelivr') !== -1 ||
e.request.url.indexOf('cloudflare') !== -1) {
e.respondWith(
fetch(e.request).catch(function() {
return caches.match(e.request);
})
);
} else {
e.respondWith(
caches.match(e.request).then(function(cached) {
return cached || fetch(e.request);
})
);
}
});
