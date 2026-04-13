// Service Worker for Disaster Dashboard PWA
// Enables offline functionality, background sync, and app shell caching

const CACHE_NAME = 'disaster-dashboard-v1';
const RUNTIME_CACHE = 'disaster-dashboard-runtime-v1';
const STATIC_ASSETS = [
  '/',
  '/app.js',
  '/globals.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendedInstallEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendedActivateEvent) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME && name !== RUNTIME_CACHE) {
            return caches.delete(name);
          }
        }),
      );
      await self.clients.claim();
    })(),
  );
});

// Fetch event - network first with cache fallback for API, cache first for assets
self.addEventListener('fetch', (event: ExtendedFetchEvent) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first, cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await caches.match(request);
          return cached || new Response('Offline - API unavailable', { status: 503 });
        }
      })(),
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response.ok && request.url.match(/\.(js|css|png|jpg|svg)$/)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return new Response('Offline', { status: 503 });
      }
    })(),
  );
});

// Background sync for offline incident reports
self.addEventListener('sync', (event: ExtendedSyncEvent) => {
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncIncidentReports());
  }
});

async function syncIncidentReports() {
  try {
    const db = await openIndexedDB();
    const reports = await getOfflineReports(db);

    for (const report of reports) {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        await deleteOfflineReport(db, report.id);
      }
    }
    return 'Sync completed';
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error;
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('DisasterDashboard', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getOfflineReports(db: any) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['incidents'], 'readonly');
    const store = tx.objectStore('incidents');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteOfflineReport(db: any, id: string) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['incidents'], 'readwrite');
    const store = tx.objectStore('incidents');
    const req = store.delete(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Push notifications for alerts
self.addEventListener('push', (event: ExtendedPushEvent) => {
  if (!event.data) return;

  const options: NotificationOptions = {
    body: event.data.text(),
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'disaster-alert',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Disaster Alert', options),
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event: ExtendedNotificationEvent) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return (client as any).focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      }),
    );
  }
});

// TypeScript type extensions
declare global {
  interface WorkerGlobalScope {
    addEventListener: any;
    skipWaiting: () => Promise<void>;
  }
}

interface ExtendedInstallEvent extends ExtendEvent {
  waitUntil: (promise: Promise<any>) => void;
}

interface ExtendedActivateEvent extends ExtendEvent {
  waitUntil: (promise: Promise<any>) => void;
}

interface ExtendedFetchEvent extends FetchEvent {
  respondWith: (response: Response | Promise<Response>) => void;
}

interface ExtendedSyncEvent extends ExtendEvent {
  tag: string;
  waitUntil: (promise: Promise<any>) => void;
}

interface ExtendedPushEvent extends PushEvent {
  data: PushMessageData;
  waitUntil: (promise: Promise<any>) => void;
}

interface ExtendedNotificationEvent extends NotificationEvent {
  action: string;
  notification: Notification;
  waitUntil: (promise: Promise<any>) => void;
}
