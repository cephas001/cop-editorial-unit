require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import all route modules
const articleRoutes = require("./routes/articles");
const authRoutes = require("./routes/auth");
const brainstormRoutes = require("./routes/brainstorm");
const commentRoutes = require("./routes/comments");
const taskRoutes = require("./routes/task");
const userRoutes = require("./routes/users");
const activityRoutes = require("./routes/activities");
const notificationRoutes = require("./routes/notifications");
const kudosRoutes = require("./routes/kudos");

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// MOUNT ROUTES
// ==========================================
app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brainstorm", brainstormRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/kudos", kudosRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
