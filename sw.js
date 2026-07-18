// =============================================
// SERVICE WORKER — Notifikasi Pasien Baru
// RS Mitra Plumbon | Radiologi
// =============================================

const CACHE_NAME = 'radiologi-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Terima pesan dari halaman utama
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PASIEN_BARU') {
        showNotification(event.data);
    }
});

// Tampilkan notifikasi sistem
function showNotification(data) {
    const title = '🚨 PASIEN BARU — Radiologi';
    const options = {
        body: data.pesan || 'Ada pasien baru, mohon segera ditindaklanjuti.',
        icon: 'logo.jpeg',
        badge: 'logo.jpeg',
        tag: 'pasien-baru',       // Ganti notif lama dengan yang baru
        renotify: true,           // Tetap berbunyi meski tag sama
        requireInteraction: false, // Tidak harus diklik untuk hilang
        vibrate: [300, 100, 300, 100, 300],
        silent: false,
        timestamp: Date.now(),
    };

    event.waitUntil?.(
        self.registration.showNotification(title, options)
    );
    self.registration.showNotification(title, options);
}

// Klik notifikasi → buka/fokus tab aplikasi
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

// Push dari server (jika VAPID dikonfigurasi di masa depan)
self.addEventListener('push', (event) => {
    let data = { pesan: 'Ada pasien baru!' };
    try { data = event.data.json(); } catch (e) {}
    event.waitUntil(showNotification(data));
});
