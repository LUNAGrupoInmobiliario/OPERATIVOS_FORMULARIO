// ── Luna GI — Service Worker v6 ──────────────────────────────────
// Cambia el número de versión cada vez que actualices index.html
const CACHE = 'luna-gi-v6';

const PRECACHE = [
  './',
  './index.html',
  './bitacora.html',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700;800&display=swap'
];

// ── INSTALL: precachea los recursos clave ────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: elimina cachés viejos ──────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first para assets, network-first para Firebase ──
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // APIs de Firebase (datos y auth): siempre red, sin cachear.
  // OJO: fonts.googleapis.com NO entra aquí para que funcione offline.
  if (
    url.hostname === 'firestore.googleapis.com' ||
    url.hostname === 'identitytoolkit.googleapis.com' ||
    url.hostname === 'securetoken.googleapis.com' ||
    url.hostname.endsWith('firebaseio.com') ||
    url.hostname.endsWith('firebasestorage.app') ||
    url.hostname === 'firebasestorage.googleapis.com'
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // Todo lo demás: cache-first con actualización en background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(response => {
        // Las respuestas redirigidas no pueden servirse a una navegación:
        // se "limpian" clonando el cuerpo en una respuesta nueva
        if (response && response.redirected) {
          return response.blob().then(body => new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          }));
        }
        return response;
      }).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => null);

      // Si hay cache lo sirve inmediatamente y actualiza en background
      // Si no hay cache espera la red
      return cached || networkFetch.then(r => r || new Response('Sin conexión', {
        status: 503,
        headers: {'Content-Type': 'text/plain'}
      }));
    })
  );
});
