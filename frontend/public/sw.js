// public/sw.js
import { precacheAndRoute } from "workbox-precaching";

// 1. MAINTAIN OFFLINE CAPABILITIES
// This injects the assets Vite compiled so your PWA still works offline!
precacheAndRoute(self.__WB_MANIFEST);

// 2. LISTEN FOR INCOMING PUSH NOTIFICATIONS
self.addEventListener("push", function (event) {
  if (event.data) {
    const payload = event.data.json();

    const options = {
      body: payload.body,
      icon: "/pwa-192x192.png", // Re-using your existing PWA icon!
      badge: "/pwa-192x192.png", // The tiny monochrome icon shown in Android status bars
      vibrate: [100, 50, 100],
      data: {
        url: payload.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(payload.title, options));
  }
});

// 3. HANDLE NOTIFICATION CLICKS (Deep Linking)
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Close the popup

  const urlToOpen = event.notification.data.url;

  // Check if the PWA is already open. If so, focus it. Otherwise, open a new window.
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        let matchingClient = null;
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(urlToOpen)) {
            matchingClient = client;
            break;
          }
        }
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
