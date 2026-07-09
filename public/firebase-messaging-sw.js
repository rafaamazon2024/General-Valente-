importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBuGLNyLQFO67SOitCoZtLTf2QIQnJHEiU',
  authDomain: 'gen-lang-client-0942239949.firebaseapp.com',
  projectId: 'gen-lang-client-0942239949',
  storageBucket: 'gen-lang-client-0942239949.firebasestorage.app',
  messagingSenderId: '612174459048',
  appId: '1:612174459048:web:bbdf49a1ac12e902ea529d',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const action = payload.data?.action;

  self.registration.showNotification(title || 'RAFAEL_OS', {
    body: body || '',
    icon: '/vite.svg',
    data: { action },
    actions: action
      ? [
          { action: 'sim', title: 'SIM' },
          { action: 'nao', title: 'NÃO' },
        ]
      : [],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = '/';
  if (event.action === 'sim' || event.action === 'nao') {
    targetUrl = `/?action=${event.action}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
