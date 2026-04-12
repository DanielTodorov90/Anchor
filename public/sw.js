const CACHE_NAME = 'anchor-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/app.js',
  '/src/style.css',
  '/src/modules/chat.js',
  '/src/modules/portfolio.js',
  '/src/modules/markets.js',
  '/src/modules/tasks.js',
  '/src/modules/earnings.js',
  '/src/modules/news.js',
  '/src/modules/wordpress.js',
  '/src/utils/api.js',
  '/src/utils/speech.js',
  '/src/utils/storage.js',
  '/public/manifest.json'
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first for static, network first for API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls — always network
  if (url.pathname.startsWith('/api/') || url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(event.request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Static — cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      return response;
    }))
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'A.N.C.H.O.R. има съобщение за теб',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Отвори' },
      { action: 'dismiss', title: 'Затвори' }
    ],
    tag: data.tag || 'anchor-notification',
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(data.title || 'A.N.C.H.O.R.', options));
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url || '/');
    })
  );
});

// Background sync — morning briefing
self.addEventListener('sync', event => {
  if (event.tag === 'morning-briefing') {
    event.waitUntil(sendMorningBriefing());
  }
});

async function sendMorningBriefing() {
  try {
    const res = await fetch('/api/morning-briefing');
    const data = await res.json();
    await self.registration.showNotification('⚓ A.N.C.H.O.R. — Сутрешен бюлетин', {
      body: data.summary || 'Добро утро, Danny! Виж пазарите.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: 'morning-briefing',
      data: { url: '/?tab=markets' }
    });
  } catch (e) {
    console.error('Morning briefing failed:', e);
  }
}
