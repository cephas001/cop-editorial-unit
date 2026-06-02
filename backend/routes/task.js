const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

// 1. GET: Fetch tasks (Supports personal view or global team view)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { scope } = req.query; // Look for ?scope=all
    let whereClause = {};

    // If scope is not 'all', restrict to the logged-in user
    if (scope !== "all") {
      whereClause = { assigneeId: req.user.id };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      // NEW: Include the assignee's basic info for the global calendar
      include: {
        assignee: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// 2. POST: Create a new task
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only Unit Heads can assign tasks." });
    }

    const { title, description, priority, dueDate, assigneeId } = req.body;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        assignerId: req.user.id,
      },
    });

    // NEW: Notify the assigned user
    if (assigneeId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          content: `New Task Assigned: "${title}"`,
        },
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// 3. PATCH: Quick-toggle task status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return res.status(404).json({ error: "Task not found" });

    if (existingTask.assigneeId !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this task." });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    // NEW: Notify the assigner if the task is completed
    if (status === "COMPLETED" && existingTask.assignerId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: existingTask.assignerId,
          content: `Task Completed: "${existingTask.title}"`,
        },
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

module.exports = router;
