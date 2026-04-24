const CACHE_NAME = 'game-server-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/team.html',
  '/dashboard.html',
  '/database.html',
  '/style.css',
  '/script.js',
  '/team-script.js',
  '/dashboard.js',
  '/background.js',
  '/transition.js',
  '/cursor-effects.js',
  '/logo.jpg',
  '/logo_new.jpeg',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Strategy: Stale-While-Revalidate
// This allows the app to work offline by serving from cache first,
// while also updating the cache in the background if network is available.
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Skip API requests and large media files - let them go to the network directly
  // We can't cache these effectively for offline use without specialized logic
  const isMedia = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || 
                  url.includes('.mp3') || url.includes('.wav') || url.includes('/api/');
  if (isMedia) {
    // Explicitly do not call event.respondWith()
    return;
  }

  // Handle caching for other requests
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if found
      if (cachedResponse) {
        // Update cache in the background (stale-while-revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request);
    })
  );
});
