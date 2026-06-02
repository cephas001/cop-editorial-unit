const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

// Get activities for a specific article (For Editor Sidebar)
router.get("/article/:articleId", requireAuth, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { articleId: req.params.articleId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true, avatarUrl: true } } },
    });
    res.json(activities);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// GET /api/activities - Fetch global recent activities for the dashboard
router.get("/", requireAuth, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10, // Limit to recent 10 to keep the dashboard fast
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
        article: { select: { title: true } },
      },
    });

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

module.exports = router;
