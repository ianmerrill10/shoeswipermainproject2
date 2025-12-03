// ShoeSwiper Service Worker for Push Notifications and Caching
const CACHE_NAME = 'shoeswiper-v1';
const AFFILIATE_TAG = 'shoeswiper-20';

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching critical assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Static asset extensions for Cache First strategy
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];

// Check if request is for a static asset
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

// Check if request is for an API call
function isApiRequest(url) {
  // Match Supabase API endpoints (e.g., *.supabase.co)
  if (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in')) {
    return true;
  }
  // Match local API endpoints
  if (url.pathname.startsWith('/api/')) {
    return true;
  }
  // Match AWS endpoints (e.g., *.amazonaws.com)
  if (url.hostname.endsWith('.amazonaws.com')) {
    return true;
  }
  return false;
}

// Check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Cache First strategy - for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    throw error;
  }
}

// Network First strategy - for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate strategy - for HTML pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Stale While Revalidate network failed:', error);
    if (cachedResponse) {
      return cachedResponse;
    }
    // No cache available, throw error to let browser handle it
    throw error;
  });
  
  return cachedResponse || fetchPromise;
}

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Apply appropriate caching strategy
  if (isStaticAsset(url)) {
    // Cache First for static assets
    event.respondWith(cacheFirst(event.request));
  } else if (isApiRequest(url)) {
    // Network First for API requests
    event.respondWith(networkFirst(event.request));
  } else if (isNavigationRequest(event.request)) {
    // Stale While Revalidate for navigation requests
    event.respondWith(staleWhileRevalidate(event.request));
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
