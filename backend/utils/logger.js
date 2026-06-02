const prisma = require("../prismaClient");

const logActivity = async (userId, articleId, type, message) => {
  try {
    await prisma.activity.create({
      data: { userId, articleId, type, message },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

module.exports = { logActivity };
