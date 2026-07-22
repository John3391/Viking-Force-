// firebase-messaging-sw.js - Firebase Cloud Messaging Service Worker for Diário do Guerreiro
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCHJlWTIKIpKc3duV_9PFe0QO9A9eKnGHI",
  authDomain: "flutter-ai-playground-dc7ae.firebaseapp.com",
  projectId: "flutter-ai-playground-dc7ae",
  storageBucket: "flutter-ai-playground-dc7ae.firebasestorage.app",
  messagingSenderId: "1047815781145",
  appId: "1:1047815781145:web:b80a49fa1d465fd77c2388"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensagem Push FCM em segundo plano recebida:', payload);

    const notificationTitle = payload.notification?.title || '⚔️ Nova Ficha de Treino Publicada!';
    const notificationOptions = {
      body: payload.notification?.body || 'Seu treinador publicou um novo treino no Diário do Guerreiro!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 300],
      data: payload.data || {},
      tag: 'viking-workout-push',
      renotify: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (err) {
  console.warn('[firebase-messaging-sw.js] SW FCM initialization notice:', err);
}

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
        return clients.openWindow('/');
      }
    })
  );
});
