/* Cache-first para que la app abra sin señal. Los datos nunca pasan por acá:
   viven en IndexedDB, en el dispositivo. */
const V = 'diario-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
                './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(V).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
