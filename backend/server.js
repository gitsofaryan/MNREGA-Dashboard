require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const logger = require("./utils/logger");
const db = require("./db/database");
const apiRoutes = require("./routes/api");
const { syncAllStatesData } = require("./services/syncService");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db.isConnected() ? "connected" : "disconnected",
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await db.connect();
    logger.info("Database connected successfully");

    // Initialize database tables
    await db.initTables();
    logger.info("Database tables initialized");

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    });

    // Schedule data sync every 4 hours
    const cronSchedule = process.env.SYNC_CRON_SCHEDULE || "0 */4 * * *";
    cron.schedule(cronSchedule, async () => {
      logger.info("Starting scheduled data sync...");
      try {
        await syncAllStatesData();
        logger.info("Scheduled data sync completed successfully");
      } catch (error) {
        logger.error("Scheduled data sync failed:", error);
      }
    });
    logger.info(`Scheduled data sync: ${cronSchedule}`);

    // Initial data sync on startup (optional)
    if (process.env.SYNC_ON_STARTUP === "true") {
      logger.info("Running initial data sync...");
      setTimeout(async () => {
        try {
          await syncAllStatesData();
          logger.info("Initial data sync completed");
        } catch (error) {
          logger.error("Initial data sync failed:", error);
        }
      }, 5000); // Wait 5 seconds after startup
    }
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  await db.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  await db.disconnect();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
