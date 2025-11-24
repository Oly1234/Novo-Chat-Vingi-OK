/* eslint-disable no-restricted-globals */

// Versão do cache - INCREMENTE SEMPRE que fizer deploy
const CACHE_VERSION = 'v1.0.8';
const CACHE_NAME = `vingi-cache-${CACHE_VERSION}`;

// Arquivos para cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Instalação - Cachear arquivos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'no-cache'})));
      })
      .then(() => self.skipWaiting()) // Ativar imediatamente
  );
});

// Ativação - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assumir controle imediatamente
  );
});

// Fetch - Estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorar requisições chrome-extension e esquemas não-http
  if (!request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Sempre buscar da rede para APIs e métodos não-GET
  if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .catch((error) => {
          console.log('[SW] Fetch failed for API request:', error);
          return new Response(
            JSON.stringify({ error: 'Sem conexão com a internet' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Para assets estáticos: Network First (sempre busca nova versão)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clonar resposta para cache
        const responseToCache = response.clone();
        
        // Atualizar cache com nova versão
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Se falhar, usar cache
        return caches.match(request).then((response) => {
          if (response) {
            console.log('[SW] Serving from cache:', request.url);
            return response;
          }
          
          // Se não tiver no cache, retornar página de erro
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('[SW] Checking for updates...');
    self.registration.update();
  }
});

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);
