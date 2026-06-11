import { precacheAndRoute } from "workbox-precaching";

// 1. MAINTAIN OFFLINE CAPABILITIES
precacheAndRoute(self.__WB_MANIFEST);

// 2. LISTEN FOR INCOMING PUSH NOTIFICATIONS (Now with Focus Detection)
self.addEventListener("push", function (event) {
  if (!event.data) return;

  const payload = event.data.json();

  // Wait until we check the window state before deciding to show the notification
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        let isAppFocused = false;

        // Loop through all open tabs/windows of your PWA
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];

          // If the app is open AND they are actively looking at it
          if (client.focused) {
            // Check if they are looking at the exact chat this message belongs to
            // payload.url looks like "/messages/123-abc"
            if (client.url.includes(payload.url)) {
              isAppFocused = true; // They are staring right at the sender. Silence!
              break;
            }

            // If they are on the Dashboard, Settings, or a DIFFERENT chat,
            // isAppFocused remains false, and the notification will slide down!
          }
        }

        // THE MAGIC: If they are looking at the app, silently abort. No buzz!
        if (isAppFocused) {
          console.log("App is focused. Suppressing push notification.");
          return;
        }

        // Otherwise, the app is closed or in the background. Show the notification!
        const options = {
          body: payload.body,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          vibrate: [100, 50, 100],
          data: {
            url: payload.url || "/",
          },
        };

        return self.registration.showNotification(payload.title, options);
      }),
  );
});

// 3. HANDLE NOTIFICATION CLICKS
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

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
