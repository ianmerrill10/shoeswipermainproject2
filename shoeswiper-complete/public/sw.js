// ShoeSwiper Service Worker for Push Notifications
const CACHE_NAME = 'shoeswiper-v1';
const AFFILIATE_TAG = 'shoeswiper-20';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
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
