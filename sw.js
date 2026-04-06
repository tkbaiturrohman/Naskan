const CACHE_NAME = 'tk-absen-smart-v1';

// 1. Saat pertama kali diinstal, siapkan cache
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Langsung aktif tanpa nunggu
});

// 2. Hapus cache lama kalau ada versi baru
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Buang sampah cache lama!
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. JURUS SMART CACHE (NETWORK FIRST)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // JIKA ADA INTERNET: Ambil UI terbaru dari server, lalu diam-diam simpan ke Cache
                const cacheCopy = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, cacheCopy);
                });
                return networkResponse;
            })
            .catch(() => {
                // JIKA OFFLINE / SINYAL PUTUS: Baru pakai Cache lama yang tersimpan di HP
                return caches.match(event.request);
            })
    );
});
