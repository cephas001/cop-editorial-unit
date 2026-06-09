const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const { sendPushNotification } = require("../utils/pushHelper");

// 1. GET all comments for a specific article
router.get("/article/:articleId", requireAuth, async (req, res) => {
  try {
    const { articleId } = req.params;

    const comments = await prisma.comment.findMany({
      // Only fetch top-level comments (where parentId is null)
      where: {
        articleId: articleId,
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      // The magic of Prisma: Fetch the author, AND fetch all nested replies + their authors!
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        replies: {
          orderBy: { createdAt: "asc" }, // Chronological replies
          include: {
            author: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// 2. POST a new comment (or reply)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { articleId, content, highlightId, parentId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        highlightId,
        parentId,
        articleId,
        authorId: req.user.id,
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });

    // NEW: Notification Logic
    if (parentId) {
      // It's a reply: notify the original commenter
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (parentComment && parentComment.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            content: "Someone replied to your comment.",
          },
        });

        await sendPushNotification(parentComment.authorId, {
          title: "New Reply",
          body: "Someone replied to your comment.",
          url: `/editor/${articleId}`,
        });
      }
    } else {
      // It's a direct article comment: notify the article author
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });
      if (article && article.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: article.authorId,
            content: `New comment on your draft: "${article.title}"`,
          },
        });

        await sendPushNotification(article.authorId, {
          title: "New Comment",
          body: `New comment on your draft: "${article.title}"`,
          url: `/editor/${articleId}`,
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

// 3. PATCH to resolve a comment
router.patch("/:commentId/resolve", requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { resolved: true },
    });

    // NEW: Notify the person who wrote the comment that it was resolved
    if (existingComment && existingComment.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: existingComment.authorId,
          content: "Your comment was marked as resolved.",
        },
      });

      await sendPushNotification(existingComment.authorId, {
        title: "Comment Resolved",
        body: "Your comment was marked as resolved.",
        url: `/editor/${existingComment.articleId}`,
      });
    }

    res.json(updatedComment);
  } catch (error) {
    console.error("Error resolving comment:", error);
    res.status(500).json({ error: "Failed to resolve comment" });
  }
});

// GET /api/comments/user/me
// Get all comments made by the logged-in user
router.get("/user/me", requireAuth, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        article: { select: { id: true, title: true } },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).json({ error: "Failed to fetch user comments" });
  }
});

// PATCH /api/comments/:id
// Edit an existing comment
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // 1. Verify the comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.authorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this comment" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    // 2. Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

module.exports = router;
