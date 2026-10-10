/* Mein Ort – Offline-Helfer. Lädt nur Dateien von dieser Adresse. */
const CACHE = 'mein-ort-1.9.0';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  /* Mit Internet: beim Server nachfragen, ob es etwas Neues gibt (Updates kommen sofort).
     Ohne Internet: die gespeicherte Fassung nehmen. */
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => {
      if (r && r.ok) { const kopie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))
  );
});
