/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
void clientsClaim();

const spaNetworkFirst = new NetworkFirst({
  cacheName: 'spa-pages',
  networkTimeoutSeconds: 3,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 7 * 24 * 60 * 60
    })
  ]
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/images/catalog/'),
  new CacheFirst({
    cacheName: 'catalog-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 250,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    (url.pathname === '/api/products/meta' ||
      url.pathname === '/api/products/top' ||
      url.pathname === '/api/products'),
  new NetworkFirst({
    cacheName: 'api-read-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 24,
        maxAgeSeconds: 120
      })
    ]
  })
);

async function serveOfflineFallback(): Promise<Response> {
  const offlineDocument =
    (await matchPrecache('/offline.html')) ?? (await matchPrecache('offline.html'));
  if (offlineDocument) {
    return offlineDocument;
  }

  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (options) => {
    try {
      const response = await spaNetworkFirst.handle(options);
      if (response?.ok) {
        return response;
      }
    } catch {
      // fall through to offline shell
    }

    return serveOfflineFallback();
  }
);

interface PushPayload {
  title?: string;
  body?: string;
  tag?: string;
  url?: string;
}

async function deliverPushPayloadToClients(data: PushPayload): Promise<void> {
  const title = data.title ?? "MERN's Shop";
  const options: NotificationOptions = {
    body: data.body ?? 'You have a new notification',
    tag: data.tag ?? 'merns-shop',
    data: { url: data.url ?? '/profile' },
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };

  await self.registration.showNotification(title, options);

  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage({ type: 'push-received', payload: data });
  }
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) {
    return;
  }

  let data: PushPayload;
  try {
    data = event.data.json() as PushPayload;
  } catch {
    data = { title: "MERN's Shop", body: event.data.text() ?? 'New notification' };
  }

  event.waitUntil(deliverPushPayloadToClients(data));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/profile';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        const clientPath = new URL(client.url).pathname;
        if (clientPath === url && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data?.type === 'e2e-deliver-push' && event.data.payload) {
      const payload = event.data.payload as PushPayload;
      event.waitUntil(deliverPushPayloadToClients(payload));
    }
  });
}

export {};
