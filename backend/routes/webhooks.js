// backend/routes/webhooks.js
const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const webpush = require("web-push");

// Initialize web-push with your keys
webpush.setVapidDetails(
  "mailto:your-email@example.com", // Replace with your actual email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// POST: Triggered by Supabase Database Webhook on the `Message` table
router.post("/chat", async (req, res) => {
  try {
    // Supabase sends the new row in the `record` object
    const { record, type } = req.body;

    // We only care about new messages
    if (type !== "INSERT") return res.status(200).send("Ignored");

    const message = record;

    // 1. Get the conversation and its participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: message.conversationId },
      include: { participants: true },
    });

    if (!conversation) return res.status(404).send("Conversation not found");

    // 2. Identify the recipients (everyone EXCEPT the person who sent the message)
    const recipients = conversation.participants.filter(
      (p) => p.id !== message.senderId,
    );
    if (recipients.length === 0)
      return res.status(200).send("No recipients to notify");

    // 3. Get the sender's details for the notification title
    const sender = await prisma.user.findUnique({
      where: { id: message.senderId },
      select: { fullName: true },
    });

    // 4. Find all active push subscriptions for the recipients
    for (const recipient of recipients) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: recipient.id },
      });

      // 5. Structure the payload exactly how your sw.js expects it
      const payload = JSON.stringify({
        title: `New message from ${sender.fullName}`,
        body: message.content,
        url: `/messages/${conversation.id}`, // Important: Allows the SW to route the user to the chat when clicked
      });

      // 6. Blast the notifications
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
        } catch (pushErr) {
          // If the browser unsubscribed (e.g. user cleared cookies), clean up the database
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
            console.log(
              `Cleaned up dead subscription for user ${recipient.id}`,
            );
          } else {
            console.error("Web Push Error:", pushErr);
          }
        }
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Notifications dispatched" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
});

module.exports = router;
