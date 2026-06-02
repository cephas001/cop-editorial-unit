const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");
const { logActivity } = require("../utils/logger");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// NEW: Upload an image to the articleImages bucket
router.post(
  "/upload-image",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "No image provided" });

      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${req.user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("articleImages")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("articleImages")
        .getPublicUrl(fileName);

      res.json({ url: publicUrlData.publicUrl });
    } catch (error) {
      console.error("Image upload failed:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

// Fetch all articles (for the Directory page)
// Get all articles (Filtered by Role and Status)
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};

    if (userRole === "ADMIN") {
      // Admins see everything EXCEPT writers' private drafts
      whereClause = {
        OR: [
          { status: { in: ["IN_REVIEW", "PUBLISHED", "ARCHIVED"] } },
          { AND: [{ status: "DRAFT" }, { authorId: userId }] },
        ],
      };
    } else {
      // Writers see shared pieces and their own drafts
      whereClause = {
        OR: [
          { status: { in: ["IN_REVIEW", "PUBLISHED"] } },
          { AND: [{ status: "DRAFT" }, { authorId: userId }] },
        ],
      };
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
      },
    });

    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// 1. Create a new blank draft
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, authorId } = req.body;

    const article = await prisma.article.create({
      data: {
        title: title || "Untitled Draft",
        status: "DRAFT",
        authorId: req.user.id, // Use the authenticated user's ID
        content: {}, // Empty JSON object ready to receive Tiptap data
      },
    });

    await logActivity(req.user.id, article.id, "CREATE", "Started a new draft");
    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Failed to create article" });
  }
});

// 2. Auto-save / Update an existing article (Title, Content, or Status)
// Update Content & Status - Protected Workflow!
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // NEW: Destructure thumbnailUrl
    const { title, content, status, thumbnailUrl } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingArticle = await prisma.article.findUnique({ where: { id } });
    if (!existingArticle)
      return res.status(404).json({ error: "Article not found" });

    if (existingArticle.authorId !== userId && userRole !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Forbidden: You cannot edit this draft." });
    }

    let newStatus = existingArticle.status;

    if (status && status !== existingArticle.status) {
      if (userRole === "WRITER") {
        if (existingArticle.status === "DRAFT" && status === "IN_REVIEW") {
          await logActivity(
            userId,
            id,
            "STATUS",
            "Submitted draft for review.",
          );
          newStatus = "IN_REVIEW";
        } else {
          return res
            .status(403)
            .json({ error: "Writers can only submit drafts for review." });
        }
      } else if (userRole === "ADMIN") {
        await logActivity(
          userId,
          id,
          "STATUS",
          `Admin changed status to ${status}`,
        );
        newStatus = status;

        if (existingArticle.authorId !== userId) {
          await prisma.notification.create({
            data: {
              userId: existingArticle.authorId,
              content: `Your article "${existingArticle.title}" was moved to ${status}.`,
            },
          });
        }
      }
    }

    // NEW: Update the database with thumbnailUrl
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        status: newStatus,
        thumbnailUrl:
          thumbnailUrl !== undefined
            ? thumbnailUrl
            : existingArticle.thumbnailUrl,
      },
    });

    res.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Failed to update article" });
  }
});

// 3. Fetch a specific article to load into the Editor
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { fullName: true, avatarUrl: true },
        },
      },
    });

    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// DELETE /api/articles/purge-image
// Removes an orphaned image from Supabase Storage
router.delete("/purge-image", requireAuth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl)
      return res.status(400).json({ error: "No image URL provided" });

    // Extract the filename from the Supabase public URL
    // Format: .../storage/v1/object/public/articleImages/filename.jpg
    const fileName = imageUrl.split("/").pop();

    const { error: deleteError } = await supabase.storage
      .from("articleImages")
      .remove([fileName]);

    if (deleteError) throw deleteError;

    res.json({ success: true });
  } catch (error) {
    console.error("Purge failed:", error);
    res.status(500).json({ error: "Failed to delete image from storage" });
  }
});

module.exports = router;
