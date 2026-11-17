// Service worker: menyimpan tampilan aplikasi agar tetap terbuka saat sinyal lemah.
// Naikkan angka VERSI setiap kali file di folder ini diperbarui.
const VERSI = 'upah-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // API tidak di-cache
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(VERSI).then(c => c.put(e.request, cp)); }
        return r;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
