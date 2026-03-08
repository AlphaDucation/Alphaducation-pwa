const CACHE_NAME = 'alphaducation-library-v11';
const OFFLINE_URL = 'offline.html';

const CORE_ASSETS = [
  './',
  'index.html',
  'newspapers.html',
  'webbooks.html',
  'toolbox.html',
  'workshops.html',
  'downloads.html',
  'about.html',
  'contact.html',
  'offline.html',
  '404.html',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/js/library.js',
  'assets/js/pwa.js',
  'data/library.json',
  'manifest.webmanifest',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-512.png',
  'assets/images/covers/newspaper.svg',
  'assets/images/covers/webbook.svg',
  'assets/images/covers/toolbox.svg',
  'assets/images/covers/workshop.svg',
  'assets/images/covers/download.svg',
  'alpha-logo.png',
  'assets/resources/newsletter-issue-001-socratic-questioning.html',
  'assets/images/covers/newsletter-issue-001.png',
  'assets/resources/socratic-studio-educator-toolbox.html',
  'assets/images/covers/toolbox-1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          return cachedPage || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
        );
      })
    );
  }
});










