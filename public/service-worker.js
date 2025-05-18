// Service Worker for offline support
const CACHE_NAME = 'mobileERP-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) return;
  
  // API requests - network only with no fallback (for data integrity)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If API request fails, return a custom offline response
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'You are offline. Please check your connection and try again.' 
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
              statusText: 'Service Unavailable'
            }
          );
        })
    );
    return;
  }

  // For all other requests, try network first then fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the fresh network response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fetch fails, try to get from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, return offline fallback page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/').then((offlineResponse) => {
              return offlineResponse || new Response(
                'You are offline. Please check your connection.',
                { 
                  status: 503,
                  headers: { 'Content-Type': 'text/plain' }
                }
              );
            });
          }
          
          // For other resources not in cache, return error
          return new Response(
            'Resource unavailable offline',
            { 
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            }
          );
        });
      })
  );
});

// Background sync for queued requests when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Function to sync pending requests stored in IndexedDB
async function syncPendingRequests() {
  // Implementation would require IndexedDB for storing pending requests
  // This is a placeholder for the actual implementation
  console.log('Syncing pending requests');
}
