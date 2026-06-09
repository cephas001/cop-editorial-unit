const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");
const multer = require("multer");
const { sendPushNotification } = require("../utils/pushHelper");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// GET /api/users
// Fetches all users (useful for populating assignment dropdowns)
router.get("/", requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
      orderBy: {
        fullName: "asc", // Sort alphabetically for easier searching in UI
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// GET /api/users/:id/profile
// Fetches a specific user's public profile AND their published articles
router.get("/:id/profile", requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const userProfile = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        // Fetch only their PUBLISHED articles for the portfolio
        articles: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            createdAt: true,
            // We can add a snippet/excerpt here later when we add Tiptap
          },
        },
      },
    });

    if (!userProfile) return res.status(404).json({ error: "User not found" });

    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// POST /api/users/profile/avatar
// Uploads a new avatar to Supabase and updates the user's record
router.post(
  "/profile/avatar",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const userId = req.user.id;

      // 1. SWEEP: Find and delete the old avatar
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      console.log(currentUser);

      if (currentUser && currentUser.avatarUrl) {
        // Extract just the filename from the end of the Supabase URL
        const oldFileName = currentUser.avatarUrl.split("/").pop();

        // Delete the orphaned file from the bucket
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([oldFileName]);

        if (deleteError) {
          console.warn(
            `Failed to delete old avatar for user ${userId}:`,
            deleteError,
          );
          // We don't throw here; we still want to allow the new upload even if the cleanup fails
        }
      }

      // 2. KEEP: Upload the new avatar
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false, // We don't need upsert anymore since filenames are strictly unique
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = publicUrlData.publicUrl;

      // 3. Update Prisma
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: avatarUrl },
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          bio: true,
          role: true,
        },
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      res.status(500).json({ error: "Failed to upload profile picture" });
    }
  },
);

// DELETE /api/users/profile/avatar
// Deletes the file from Supabase and nullifies the avatar_url in Prisma
router.delete("/profile/avatar", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the user's current avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!currentUser || !currentUser.avatarUrl) {
      return res.status(400).json({ error: "No profile picture to remove." });
    }

    // 2. Extract the filename from the Supabase URL
    const fileName = currentUser.avatarUrl.split("/").pop();

    // 3. Delete the file from the Supabase bucket
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([fileName]);

    if (deleteError) {
      console.error(
        `Failed to delete avatar from bucket for user ${userId}:`,
        deleteError,
      );
      // We log the error, but we will still proceed to clear the DB just in case
      // the file was already accidentally deleted from the bucket dashboard.
    }

    // 4. Update the database to remove the URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Avatar deletion failed:", error);
    res.status(500).json({ error: "Failed to remove profile picture" });
  }
});

// PATCH /api/users/profile
// Update user bio and full name
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { fullName, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName || undefined,
        bio: bio !== undefined ? bio : undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.patch("/:id/promote", requireAuth, async (req, res) => {
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ error: "Forbidden" });

  const targetUserId = req.params.id;

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: "ADMIN" },
  });

  await supabase.auth.admin.updateUserById(targetUserId, {
    app_metadata: { custom_role: "ADMIN" },
  });

  // NEW: Congratulate them!
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      content: "You have been promoted to an ADMIN role!",
    },
  });

  await sendPushNotification(targetUserId, {
    title: "Role Upgrade",
    body: "You have been promoted to a Unit Head!",
    url: `/settings`,
  });

  res.json({ message: "User promoted to ADMIN" });
});

module.exports = router;
