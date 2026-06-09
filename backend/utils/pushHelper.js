// backend/utils/pushHelper.js
const webpush = require("web-push");
const prisma = require("../prismaClient");

const sendPushNotification = async (userId, payload) => {
  try {
    // 1. Find all devices registered to this user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
    });

    if (subscriptions.length === 0) return; // User hasn't opted in

    // 2. Format the payload as a string
    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/", // Where they go when they click it
    });

    // 3. Send the notification to all their devices simultaneously
    const notifications = subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(pushSub, message);
      } catch (err) {
        // If the device is no longer valid (e.g. they revoked permission), delete it
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Push notification failed for a device:", err);
        }
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Error executing push notification batch:", error);
  }
};

module.exports = { sendPushNotification };
