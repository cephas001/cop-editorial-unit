const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const prisma = require("../prismaClient");

// 1. Register a new user
router.post("/register", async (req, res) => {
  const { email, password, fullName } = req.body;

  // Tracking variables for rollback
  let authUserId = null;
  let prismaUserCreated = false;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Step A: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Store ID immediately so we can roll back if subsequent steps fail
    authUserId = authData.user.id;

    // Step B: Mirror the user in our Prisma database
    const user = await prisma.user.create({
      data: {
        id: authUserId, // Keep UUIDs perfectly synced!
        email: email,
        fullName: fullName || "New Writer",
        role: "WRITER",
      },
    });

    // Mark as created so we know to delete from Prisma if Step C fails
    prismaUserCreated = true;

    // Step C: Inject Custom Claims
    const { error: claimError } = await supabase.auth.admin.updateUserById(
      authUserId,
      {
        app_metadata: { custom_role: "WRITER" },
      },
    );

    if (claimError) throw claimError;

    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error("Registration error:", error.message);

    // --- ROLLBACK LOGIC ---

    // 1. Rollback Prisma if it was created but the custom claims failed
    if (prismaUserCreated && authUserId) {
      try {
        console.log(`Rolling back: Deleting Prisma user ${authUserId}`);
        await prisma.user.delete({ where: { id: authUserId } });
      } catch (prismaRollbackError) {
        console.error(
          "Critical: Failed to rollback Prisma user:",
          prismaRollbackError.message,
        );
      }
    }

    // 2. Rollback Supabase Auth if it was created but anything downstream failed
    if (authUserId) {
      try {
        console.log(`Rolling back: Deleting Supabase Auth user ${authUserId}`);
        await supabase.auth.admin.deleteUser(authUserId);
      } catch (sbRollbackError) {
        console.error(
          "Critical: Failed to rollback Supabase Auth user:",
          sbRollbackError.message,
        );
      }
    }

    res.status(400).json({ error: error.message || "Failed to register" });
  }
});

// 2. Login an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch the user's rich profile from Prisma
    const userProfile = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    // Send the token and profile back to Nuxt
    res.json({
      access_token: data.session.access_token,
      user: userProfile,
    });
  } catch (error) {
    if (error.message.includes("fetch")) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(401).json({ error: "Invalid login credentials" });
  }
});

module.exports = router;
