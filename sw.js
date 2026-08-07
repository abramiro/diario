/* Service worker.
   El HTML va primero a la red y cae a la caché solo si no hay conexión: así
   una versión nueva se ve en la primera recarga, sin tener que recargar dos
   veces ni borrar nada a mano. Los archivos que no cambian (iconos,
   manifiesto) sí van cache-first, que es más rápido.
   Los datos NUNCA pasan por acá: viven en IndexedDB, en el dispositivo. */
const V = 'diario-v37';
const ESTATICOS = ['./manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(V)
      .then(c => c.addAll(['./', './index.html', ...ESTATICOS]))
      .catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      /* APIs externas, sin tocar */

  const esHTML = req.mode === 'navigate'
              || url.pathname.endsWith('/')
              || url.pathname.endsWith('.html');

  if (esHTML){
    /* red primero: la versión nueva se ve en la primera recarga sin caché de disco */
    e.respondWith(
      fetch(new Request(req, {cache: 'no-store'}))
        .then(res => {
          const copia = res.clone();
          caches.open(V).then(c => c.put(req, copia)).catch(()=>{});
          return res;
        })
        .catch(() => caches.match(req, {ignoreSearch:true})
                       .then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  /* lo estático: caché primero, y se refresca por detrás */
  e.respondWith(
    caches.match(req, {ignoreSearch:true}).then(hit => hit || fetch(req).then(res => {
      const copia = res.clone();
      caches.open(V).then(c => c.put(req, copia)).catch(()=>{});
      return res;
    }))
  );
});

/* la app puede pedir que se active una versión nueva sin esperar */
self.addEventListener('message', e => {
  if (e.data === 'actualizar') self.skipWaiting();
});
