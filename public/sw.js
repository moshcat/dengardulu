self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');
  if (audioFile) {
    const cache = await caches.open('share-target');
    await cache.put('/shared-audio', new Response(audioFile));
  }
  return Response.redirect('/analyze?shared=1', 303);
}
