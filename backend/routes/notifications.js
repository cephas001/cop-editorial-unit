const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

// 1. GET: Fetch recent notifications for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Only grab the 20 most recent to keep it fast
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// 2. PATCH: Mark a specific notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    // updateMany is safer here to ensure the notification actually belongs to the user
    await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// 3. PATCH: Mark all notifications as read
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// 4. DELETE: Remove a specific notification
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    // First, verify the notification belongs to the logged-in user
    const existingNotification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!existingNotification || existingNotification.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this notification." });
    }

    await prisma.notification.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// 5. DELETE: Clear all notifications for the user
router.delete("/all/clear", requireAuth, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

module.exports = router;
