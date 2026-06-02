const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

// 1. GET all kudos for the wall
router.get("/", requireAuth, async (req, res) => {
  try {
    const kudos = await prisma.kudos.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });
    res.json(kudos);
  } catch (error) {
    console.error("Error fetching kudos:", error);
    res.status(500).json({ error: "Failed to fetch kudos wall" });
  }
});

// 2. POST a new kudo sticky note & Notify Everyone
router.post("/", requireAuth, async (req, res) => {
  try {
    const { content, color } = req.body;

    // 1. Create the new Kudo
    const newKudo = await prisma.kudos.create({
      data: {
        content,
        color: color || "bg-amber-100",
        authorId: req.user.id,
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });

    // 2. Fetch all users EXCEPT the person who just posted
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
      },
      select: { id: true },
    });

    // 3. Bulk create notifications for everyone else
    if (otherUsers.length > 0) {
      // Map over the users to create an array of notification objects
      const notificationsToInsert = otherUsers.map((user) => ({
        userId: user.id,
        content: `${req.user.fullName} posted a new Kudo on the Team Wall!`,
        type: "COMMENT", // You can use "COMMENT" or create a new "KUDOS" type in your Prisma schema
        isRead: false,
      }));

      // Insert them all at once efficiently
      await prisma.notification.createMany({
        data: notificationsToInsert,
      });
    }

    res.status(201).json(newKudo);
  } catch (error) {
    console.error("Error posting kudo:", error);
    res.status(500).json({ error: "Failed to post on the wall" });
  }
});

module.exports = router;
