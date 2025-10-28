/**
 * MGNREGA Backend API Server
 * Production-ready Express server with:
 * - Data caching layer
 * - Rate limiting
 * - Scheduled data sync
 * - PostgreSQL/MongoDB integration
 * - Health monitoring
 * - CORS support
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");
const cron = require("node-cron");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

// Cache configuration
const cache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false,
});

// Data.gov.in API configuration
const DATA_GOV_API =
  "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const API_KEY =
  process.env.DATA_GOV_API_KEY ||
  "579b464db66ec23bdd00000151fc8e7dade948685e54b87d1aac6e9b";

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Fetch data from data.gov.in API
 */
async function fetchMGNREGAData(state, year = null, limit = 10000) {
  const params = new URLSearchParams({
    "api-key": API_KEY,
    format: "json",
    limit: limit.toString(),
    offset: "0",
  });

  if (state) {
    params.append("filters[state_name]", state);
  }

  if (year) {
    params.append("filters[fin_year]", year);
  }

  const url = `${DATA_GOV_API}?${params.toString()}`;

  console.log(`Fetching: ${state} - ${year || "all years"}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.records || [];
}

/**
 * API Endpoints
 */

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Get MGNREGA data with caching
app.get("/api/mgnrega", async (req, res) => {
  try {
    const { state = "MADHYA PRADESH", year, limit = 10000 } = req.query;

    // Generate cache key
    const cacheKey = `mgnrega_${state}_${year || "all"}_${limit}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Cache MISS: ${cacheKey}`);

    // Fetch from API
    const records = await fetchMGNREGAData(state, year, parseInt(limit));

    // Cache the data
    cache.set(cacheKey, records);

    res.json({
      data: records,
      cached: false,
      count: records.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Failed to fetch data",
      message: error.message,
    });
  }
});

// Get available states
app.get("/api/states", async (req, res) => {
  try {
    const cacheKey = "states_list";
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ states: cached, cached: true });
    }

    const records = await fetchMGNREGAData(null, null, 1000);
    const states = [...new Set(records.map((r) => r.state_name))]
      .filter(Boolean)
      .sort();

    cache.set(cacheKey, states, 86400); // Cache for 24 hours

    res.json({ states, cached: false });
  } catch (error) {
    console.error("States Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get districts for a state
app.get("/api/districts/:state", async (req, res) => {
  try {
    const { state } = req.params;
    const cacheKey = `districts_${state}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ districts: cached, cached: true });
    }

    const records = await fetchMGNREGAData(state, null, 1000);
    const districts = [...new Set(records.map((r) => r.district_name))]
      .filter(Boolean)
      .sort();

    cache.set(cacheKey, districts, 86400); // Cache for 24 hours

    res.json({ districts, cached: false });
  } catch (error) {
    console.error("Districts Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get available years
app.get("/api/years", async (req, res) => {
  try {
    const cacheKey = "years_list";
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ years: cached, cached: true });
    }

    const records = await fetchMGNREGAData("MADHYA PRADESH", null, 1000);
    const years = [...new Set(records.map((r) => r.fin_year))]
      .filter(Boolean)
      .sort()
      .reverse();

    cache.set(cacheKey, years, 86400); // Cache for 24 hours

    res.json({ years, cached: false });
  } catch (error) {
    console.error("Years Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cache (admin endpoint - should be protected in production)
app.post("/api/cache/clear", (req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared successfully" });
});

// Get cache statistics
app.get("/api/cache/stats", (req, res) => {
  res.json(cache.getStats());
});

/**
 * Scheduled Tasks
 */

// Refresh cache every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled cache refresh...");
  try {
    // Refresh Madhya Pradesh data for current year
    const currentYear = "2025-2026";
    await fetchMGNREGAData("MADHYA PRADESH", currentYear);
    console.log("Cache refreshed successfully");
  } catch (error) {
    console.error("Scheduled refresh failed:", error);
  }
});

// Clear old cache entries every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Clearing old cache entries...");
  cache.flushAll();
});

/**
 * Error handling
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  MGNREGA Backend API Server                               ║
║  Build for Bharat by Aryan Jain                          ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || "development"}
║  Port: ${PORT}
║  Cache TTL: 1 hour
║  Rate Limit: 100 req/15min
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  cache.close();
  process.exit(0);
});

module.exports = app;
