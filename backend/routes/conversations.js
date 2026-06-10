// backend/routes/conversations.js
const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

// GET all conversations for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: req.user.id }, // Only get chats this user is in
        },
      },
      include: {
        participants: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only grab the very last message for the preview snippet
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc", // Sort by most recent activity
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET a specific conversation and its paginated message history
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // ISO timestamp string passed from frontend

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        messages: {
          // If 'before' is provided, only fetch messages older than that timestamp
          where: before ? { createdAt: { lt: new Date(before) } } : undefined,
          orderBy: { createdAt: "desc" }, // Grab newest historical chunks first
          take: limit,
        },
      },
    });

    if (!conversation) return res.status(404).json({ error: "Chat not found" });

    // Security Check
    const isParticipant = conversation.participants.some(
      (p) => p.id === req.user.id,
    );
    if (!isParticipant && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to load chat" });
  }
});

// POST a new message to a conversation
router.post("/:id/messages", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        conversationId: id,
      },
    });

    // Update the conversation's lastMessageAt timestamp for the inbox sorting
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// POST: Create a new 1-on-1 chat (or return existing)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res
        .status(400)
        .json({ error: "Cannot start a chat with yourself." });
    }

    // 1. Check if a 1-on-1 chat already exists between these two users
    const existingChat = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { id: currentUserId } } },
          { participants: { some: { id: targetUserId } } },
        ],
      },
    });

    // If it exists, just return the ID so the frontend can route to it
    if (existingChat) {
      return res.json(existingChat);
    }

    // 2. If it doesn't exist, create a new one and connect both users
    const newChat = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          connect: [{ id: currentUserId }, { id: targetUserId }],
        },
      },
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

module.exports = router;
