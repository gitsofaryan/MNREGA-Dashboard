const express = require("express");
const router = express.Router();
const NodeCache = require("node-cache");
const db = require("../db/database");
const logger = require("../utils/logger");
const { syncStateData } = require("../services/syncService");

// In-memory cache (4 hour TTL)
const cache = new NodeCache({ stdTTL: 14400, checkperiod: 600 });

// GET /api/states - Get all states
router.get("/states", async (req, res) => {
  try {
    const cacheKey = "all_states";
    const cached = cache.get(cacheKey);

    if (cached) {
      logger.debug("Returning cached states");
      return res.json({ source: "cache", data: cached });
    }

    const result = await db.query("SELECT * FROM states ORDER BY state_name");
    const states = result.rows;

    cache.set(cacheKey, states);
    res.json({ source: "database", data: states });
  } catch (error) {
    logger.error("Error fetching states:", error);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// GET /api/districts/:stateName - Get districts for a state
router.get("/districts/:stateName", async (req, res) => {
  try {
    const { stateName } = req.params;
    const cacheKey = `districts_${stateName}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      logger.debug(`Returning cached districts for ${stateName}`);
      return res.json({ source: "cache", data: cached });
    }

    const state = await db.getStateByName(stateName);
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }

    const result = await db.query(
      "SELECT * FROM districts WHERE state_id = $1 ORDER BY district_name",
      [state.id]
    );
    const districts = result.rows;

    cache.set(cacheKey, districts);
    res.json({ source: "database", data: districts });
  } catch (error) {
    logger.error("Error fetching districts:", error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// GET /api/data/:stateName - Get MGNREGA data for a state
router.get("/data/:stateName", async (req, res) => {
  try {
    const { stateName } = req.params;
    const { finYear, month } = req.query;

    const cacheKey = `data_${stateName}_${finYear || "all"}_${month || "all"}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      logger.debug(`Returning cached data for ${stateName}`);
      return res.json({ source: "cache", data: cached, count: cached.length });
    }

    const state = await db.getStateByName(stateName);
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }

    let query = `
      SELECT 
        m.*,
        d.district_name,
        s.state_name
      FROM mgnrega_data m
      JOIN districts d ON m.district_id = d.id
      JOIN states s ON d.state_id = s.id
      WHERE s.id = $1
    `;
    const params = [state.id];

    if (finYear) {
      query += ` AND m.fin_year = $${params.length + 1}`;
      params.push(finYear);
    }

    if (month) {
      query += ` AND m.month = $${params.length + 1}`;
      params.push(month);
    }

    query += " ORDER BY d.district_name, m.fin_year DESC, m.month";

    const result = await db.query(query, params);
    const data = result.rows.map((row) => ({
      district_name: row.district_name,
      state_name: row.state_name,
      fin_year: row.fin_year,
      month: row.month,
      Total_No_of_JobCards_issued: row.total_job_cards_issued,
      Total_No_of_Workers: row.total_workers,
      Total_No_of_Active_Workers: row.total_active_workers,
      SC_workers_against_active_workers: row.sc_workers,
      ST_workers_against_active_workers: row.st_workers,
      Total_Women_out_of_active_workers: row.total_women,
      Average_days_of_employment_provided_per_Household:
        row.avg_days_employment,
      Number_of_HHs_completed_100_Days_of_Wage_employment:
        row.hhs_completed_100_days,
      Total_No_of_HHs_worked: row.total_households_worked,
      Total_No_of_Individuals_worked: row.total_individuals_worked,
      No_of_Differently_abled_persons_worked: row.differently_abled_worked,
      Number_of_GPs_with_NIL_exp: row.number_of_gps,
      Total_Exp: row.total_expenditure,
      Wage_material_ratio: row.wage_material_ratio,
      Total_No_of_Works_Takenup_New_Spill: row.total_work_takenup,
      Number_of_Ongoing_Works: row.number_of_ongoing_works,
      Number_of_Completed_Works: row.number_of_completed_works,
      Total_Adm_Expenditure: row.total_administrative_expenditure,
      Total_No_of_Persondays_Generated_so_far:
        row.total_number_persondays_generated,
      Persondays_Generated_for_Women: row.persondays_generated_women,
      Persondays_Generated_for_SC: row.persondays_generated_sc,
      Persondays_Generated_for_ST: row.persondays_generated_st,
    }));

    cache.set(cacheKey, data);
    res.json({ source: "database", data, count: data.length });
  } catch (error) {
    logger.error("Error fetching MGNREGA data:", error);
    res.status(500).json({ error: "Failed to fetch MGNREGA data" });
  }
});

// POST /api/sync/:stateName - Manually trigger sync for a state
router.post("/sync/:stateName", async (req, res) => {
  try {
    const { stateName } = req.params;
    logger.info(`Manual sync triggered for ${stateName}`);

    const result = await syncStateData(stateName);

    // Clear cache for this state
    const cacheKeys = cache.keys().filter((key) => key.includes(stateName));
    cacheKeys.forEach((key) => cache.del(key));
    logger.info(`Cleared ${cacheKeys.length} cache entries for ${stateName}`);

    res.json({
      success: true,
      message: `Sync completed for ${stateName}`,
      result,
    });
  } catch (error) {
    logger.error("Error during manual sync:", error);
    res.status(500).json({ error: "Failed to sync data" });
  }
});

// GET /api/stats/:stateName - Get aggregated statistics
router.get("/stats/:stateName", async (req, res) => {
  try {
    const { stateName } = req.params;
    const { finYear } = req.query;

    const cacheKey = `stats_${stateName}_${finYear || "all"}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ source: "cache", data: cached });
    }

    const state = await db.getStateByName(stateName);
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }

    let query = `
      SELECT 
        COUNT(DISTINCT m.district_id) as total_districts,
        SUM(m.total_job_cards_issued) as total_job_cards,
        SUM(m.total_workers) as total_workers,
        SUM(m.total_active_workers) as total_active_workers,
        SUM(m.number_of_completed_works) as total_completed_works,
        SUM(m.total_expenditure) as total_expenditure,
        m.fin_year,
        m.month
      FROM (
        SELECT DISTINCT ON (district_id, fin_year)
          district_id,
          total_job_cards_issued,
          total_workers,
          total_active_workers,
          number_of_completed_works,
          total_expenditure,
          fin_year,
          month
        FROM mgnrega_data
        WHERE district_id IN (
          SELECT id FROM districts WHERE state_id = $1
        )
        ${finYear ? "AND fin_year = $2" : ""}
        ORDER BY district_id, fin_year, 
          CASE month
            WHEN 'April' THEN 1
            WHEN 'May' THEN 2
            WHEN 'June' THEN 3
            WHEN 'July' THEN 4
            WHEN 'August' THEN 5
            WHEN 'September' THEN 6
            WHEN 'October' THEN 7
            WHEN 'November' THEN 8
            WHEN 'December' THEN 9
            WHEN 'January' THEN 10
            WHEN 'February' THEN 11
            WHEN 'March' THEN 12
          END DESC
      ) m
      GROUP BY m.fin_year, m.month
      ORDER BY m.fin_year DESC, m.month
    `;

    const params = finYear ? [state.id, finYear] : [state.id];
    const result = await db.query(query, params);

    const stats = result.rows[0] || {
      total_districts: 0,
      total_job_cards: 0,
      total_workers: 0,
      total_active_workers: 0,
      total_completed_works: 0,
      total_expenditure: 0,
    };

    cache.set(cacheKey, stats);
    res.json({ source: "database", data: stats });
  } catch (error) {
    logger.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// GET /api/cache/stats - Get cache statistics
router.get("/cache/stats", (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  res.json({
    stats,
    cached_keys: keys.length,
    keys: keys,
  });
});

// DELETE /api/cache/clear - Clear all cache
router.delete("/cache/clear", (req, res) => {
  cache.flushAll();
  logger.info("Cache cleared manually");
  res.json({ success: true, message: "Cache cleared" });
});

module.exports = router;
