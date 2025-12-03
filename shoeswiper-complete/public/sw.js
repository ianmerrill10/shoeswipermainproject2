// ShoeSwiper Service Worker for Push Notifications & Offline Support
const CACHE_NAME = 'shoeswiper-v1';
const STATIC_CACHE_NAME = 'shoeswiper-static-v1';
const DYNAMIC_CACHE_NAME = 'shoeswiper-dynamic-v1';
const AFFILIATE_TAG = 'shoeswiper-20';

// Assets to pre-cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
];

// Cache-first patterns (static assets)
const CACHE_FIRST_PATTERNS = [
  /\.(?:js|css|woff2?|ttf|eot)$/,
  /\/favicon\.svg$/,
  /\/icons\//,
];

// Network-first patterns (API calls, dynamic content)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[SW] Pre-caching failed:', err);
        // Don't fail installation if pre-caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine caching strategy
function getCacheStrategy(url) {
  const urlString = url.toString();
  
  // Check if should use cache-first
  for (const pattern of CACHE_FIRST_PATTERNS) {
    if (pattern.test(urlString)) {
      return 'cache-first';
    }
  }
  
  // Check if should use network-first
  for (const pattern of NETWORK_FIRST_PATTERNS) {
    if (pattern.test(urlString)) {
      return 'network-first';
    }
  }
  
  // Default to network-first for HTML, cache-first for others
  if (urlString.endsWith('/') || urlString.endsWith('.html')) {
    return 'network-first';
  }
  
  return 'cache-first';
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    // Return offline fallback if available
    return caches.match('/') || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network-first falling back to cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  const strategy = getCacheStrategy(new URL(request.url));
  
  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'ShoeSwiper',
    body: 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'shoeswiper-notification',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || data.tag,
        data: payload.data || {},
      };
    } catch (err) {
      console.error('[SW] Error parsing push data:', err);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: true,
    actions: [
      {
        action: 'buy',
        title: 'Buy Now',
        icon: '/favicon.svg',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  const notificationData = event.notification.data || {};

  if (event.action === 'dismiss') {
    return;
  }

  // Determine URL to open
  let urlToOpen = '/';

  if (event.action === 'buy' && notificationData.amazonUrl) {
    // Add affiliate tag to Amazon URL
    const url = new URL(notificationData.amazonUrl);
    url.searchParams.set('tag', AFFILIATE_TAG);
    urlToOpen = url.toString();
  } else if (notificationData.shoeId) {
    // Open app to the specific shoe
    urlToOpen = `/?shoe=${notificationData.shoeId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (urlToOpen.startsWith('http')) {
            // External URL (Amazon) - open in new tab
            return clients.openWindow(urlToOpen);
          }
          // Navigate within app
          return client.navigate(urlToOpen);
        }
      }
      // Open new window
      return clients.openWindow(urlToOpen);
    })
  );
});

// Background sync for failed notification tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-tracking') {
    console.log('[SW] Syncing notification tracking...');
    // Future: sync notification interaction data
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SHOW_LOCAL_NOTIFICATION') {
    const { title, body, data } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'shoeswiper-local',
      data,
      vibrate: [100, 50, 100],
      requireInteraction: true,
      actions: [
        {
          action: 'buy',
          title: 'Buy Now',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    });
  }
});
