const CACHE_NAME = 'demeter-1.0.36';
const ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Ne pas intercepter les requêtes externes
  if (url.indexOf('supabase.co') !== -1 ||
      url.indexOf('googleapis') !== -1 ||
      url.indexOf('jsdelivr') !== -1 ||
      url.indexOf('cloudflare') !== -1 ||
      url.indexOf('sheetjs') !== -1 ||
      url.indexOf('gstatic') !== -1 ||
      url.indexOf('fonts') !== -1 ||
      e.request.method !== 'GET') {
    return;
  }

  // Stratégie Network-First pour index.html → toujours la dernière version si en ligne
  if (url.indexOf('/index.html') !== -1 || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(function(r) {
        if (r && r.ok) {
          var clone = r.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return r;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Cache-First pour les autres assets (icônes, manifest)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(r) {
        if (r && r.ok) {
          var clone = r.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return r;
      });
    })
  );
});
