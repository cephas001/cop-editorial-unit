const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

// --- SESSIONS ---

// 1. GET all active brainstorm sessions
router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const sessions = await prisma.brainstormSession.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { ideas: true } }, // Get a count of how many ideas are in each
      },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// 2. POST a new session
router.post("/sessions", requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const newSession = await prisma.brainstormSession.create({
      data: {
        title,
        description,
        creatorId: req.user.id,
      },
    });
    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// --- IDEAS ---

// 3. GET all ideas for a specific session
router.get("/sessions/:sessionId/ideas", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const ideas = await prisma.idea.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        assignee: { select: { id: true, avatarUrl: true, fullName: true } }, // Include assignee details
      },
    });
    res.json(ideas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

// PATCH to assign a user to an idea
router.patch("/ideas/:id/assign", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;

    // Only Admins should be able to assign ideas
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can assign ideas." });
    }

    const updatedIdea = await prisma.idea.update({
      where: { id },
      data: { assigneeId },
      include: {
        assignee: { select: { fullName: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: assigneeId,
        content: `You have been assigned to idea "${updatedIdea.content}".`,
      },
    });

    res.json(updatedIdea);
  } catch (error) {
    console.error("Error assigning idea:", error);
    res.status(500).json({ error: "Failed to assign idea" });
  }
});

// 4. POST a new idea to a session
router.post("/ideas", requireAuth, async (req, res) => {
  try {
    const { content, tags, sessionId } = req.body;
    const newIdea = await prisma.idea.create({
      data: {
        content,
        tags: tags || [], // Array of strings e.g., ["urgent", "feature"]
        sessionId,
        authorId: req.user.id,
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });
    res.status(201).json(newIdea);
  } catch (error) {
    console.error("Error creating idea:", error);
    res.status(500).json({ error: "Failed to create idea" });
  }
});

// --- IDEA COMMENTS ---
// 5. PATCH to update an idea's status (For Kanban Drag-and-Drop)
router.patch("/ideas/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingIdea = await prisma.idea.findUnique({ where: { id } });

    const updatedIdea = await prisma.idea.update({
      where: { id },
      data: { status },
    });

    // NEW: Notify idea author if someone else moved their idea
    if (existingIdea && existingIdea.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: existingIdea.authorId,
          content: `Your idea was moved to ${status.replace("_", " ")}.`,
        },
      });
    }

    res.json(updatedIdea);
  } catch (error) {
    console.error("Error updating idea status:", error);
    res.status(500).json({ error: "Failed to update idea status" });
  }
});

// 6. GET comments for a specific idea
router.get("/ideas/:ideaId/comments", requireAuth, async (req, res) => {
  try {
    const comments = await prisma.ideaComment.findMany({
      where: { ideaId: req.params.ideaId },
      orderBy: { createdAt: "asc" }, // Oldest first (top to bottom reading)
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching idea comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// 7. POST a new comment to an idea
router.post("/ideas/:ideaId/comments", requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const newComment = await prisma.ideaComment.create({
      data: {
        content,
        ideaId: req.params.ideaId,
        authorId: req.user.id,
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });

    // NEW: Notify the idea's author about the new comment
    const idea = await prisma.idea.findUnique({
      where: { id: req.params.ideaId },
    });
    if (idea && idea.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: idea.authorId,
          content: "Someone commented on your brainstorm idea.",
        },
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error posting idea comment:", error);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

// 8. GET all ideas proposed by the logged-in user
router.get("/ideas/user/me", requireAuth, async (req, res) => {
  try {
    const ideas = await prisma.idea.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        session: { select: { title: true } },
      },
    });
    res.json(ideas);
  } catch (error) {
    console.error("Error fetching user ideas:", error);
    res.status(500).json({ error: "Failed to fetch user ideas" });
  }
});

// 8. PATCH to edit an idea comment
router.patch("/ideas/comments/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const existingComment = await prisma.ideaComment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Idea comment not found" });
    }

    if (existingComment.authorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this comment" });
    }

    const updatedComment = await prisma.ideaComment.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating idea comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

module.exports = router;
