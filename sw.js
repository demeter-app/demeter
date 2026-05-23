const CACHE_NAME = 'demeter-1.0.144';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('supabase.co') !== -1 ||
      url.indexOf('googleapis') !== -1 ||
      url.indexOf('jsdelivr') !== -1 ||
      url.indexOf('cloudflare') !== -1 ||
      url.indexOf('fonts') !== -1 ||
      e.request.method !== 'GET') {
    return;
  }
  // Network-First — toujours la dernière version si en ligne
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'}).then(function(response) {
      if (response && response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});