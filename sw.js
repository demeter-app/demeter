const CACHE_NAME = 'trec-v1';
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
  var url = e.request.url;
  
  // Laisser passer toutes les requetes externes sans les toucher
  if (url.indexOf('supabase.co') !== -1 ||
      url.indexOf('googleapis') !== -1 ||
      url.indexOf('jsdelivr') !== -1 ||
      url.indexOf('cloudflare') !== -1 ||
      url.indexOf('gstatic') !== -1 ||
      url.indexOf('fonts') !== -1) {
    return;
  }

  // Cache uniquement les assets locaux
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});