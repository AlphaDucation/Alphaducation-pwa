const CACHE_NAME = 'alphaducation-library-v19';
const OFFLINE_URL = 'offline.html';

const PRECACHE_ASSETS = [
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
  'assets/images/download-1.png',
  'alpha-logo.png',
  'assets/resources/newsletter-issue-001-socratic-questioning.html',
  'assets/images/covers/newsletter-issue-001.png',
  'assets/resources/socratic-studio-educator-toolbox.html',
  'assets/images/covers/toolbox-1.png',
  'Duval et le prompting/assets/img/Untitled design (10).png',
  'Duval et le prompting/assets/img/Untitled design (11).png',
  'Duval et le prompting/assets/img/Untitled design (12).png',
  'Duval et le prompting/assets/background-palette.png',
  'Duval et le prompting/assets/tedbook.png',
  'Duval et le prompting/assets/logo.png',
  'Duval et le prompting/scripts/book.js',
  'Duval et le prompting/styles/book.css',
  'Duval et le prompting/styles/book-full.css',
  'Duval et le prompting/book.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    throw new Error('Network and cache both failed.');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const pathname = requestUrl.pathname;
  const isDynamicAppFile =
    event.request.mode === 'navigate' ||
    pathname.endsWith('.html') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.webmanifest');

  if (isDynamicAppFile) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
