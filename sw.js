// Service worker: tampilan aplikasi tetap terbuka saat sinyal lemah.
// Strategi: ambil versi terbaru dari internet dulu, kalau gagal pakai salinan di HP.
// Naikkan angka VERSI setiap kali file di folder ini diperbarui.
const VERSI = 'upah-v4';
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
    Promise.race([
      fetch(e.request, { cache: 'no-cache' }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(VERSI).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
  );
});
