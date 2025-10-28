import { useState, useEffect } from "react";
import { storage } from "../lib/utils";

const API_URL =
  "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const API_KEY = "579b464db66ec23bdd00000151fc8e7dade948685e54b87d1aac6e9b";
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 hours cache
const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

// Get cache key based on filters
const getCacheKey = (state, year) => {
  return `mgnrega_${state}_${year || "all"}`;
};

const getCacheTimestampKey = (state, year) => {
  return `mgnrega_ts_${state}_${year || "all"}`;
};

/**
 * Optimized MGNREGA Data Hook
 * - Fetches only 500 records (latest data)
 * - Always filters by year (defaults to 2025-2026)
 * - Extended cache duration (4 hours)
 * - Cache-first strategy for instant loading
 */
export function useMGNREGAData(
  stateFilter = "MADHYA PRADESH",
  yearFilter = null
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const cacheKey = getCacheKey(stateFilter, yearFilter);
  const cacheTimestampKey = getCacheTimestampKey(stateFilter, yearFilter);

  const fetchData = async (forceRefresh = false, retryCount = 0) => {
    try {
      // ⚡ OPTIMIZATION: Check cache FIRST before setting loading
      if (!forceRefresh) {
        const cachedData = storage.get(cacheKey);
        const cachedTimestamp = storage.get(cacheTimestampKey);

        if (cachedData && cachedTimestamp) {
          const cacheAge = Date.now() - cachedTimestamp;

          if (cacheAge < CACHE_DURATION) {
            console.log(
              `⚡ Using cached data (${Math.round(
                cacheAge / 60000
              )} min old) - INSTANT LOAD!`
            );
            setData(cachedData);
            setLastUpdated(new Date(cachedTimestamp));
            setLoading(false);
            return; // Exit early - no API call needed!
          }
        }
      }

      setLoading(true);
      setError(null);

      // Use year filter only when provided; otherwise fetch across years (still April-only)
      const targetYear = yearFilter || null;

      // Build API URL with optimized filters
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: "500", // ⚡ Reduced from 10000 - faster API response
        offset: "0",
      });

      if (stateFilter) {
        params.append("filters[state_name]", stateFilter);
      }

      // Conditionally filter by financial year
      if (targetYear) {
        params.append("filters[fin_year]", targetYear);
      }

      // ⚡ LOCK TO APRIL ONLY - financial year start
      params.append("filters[month]", "April");

      const apiUrl = `${API_URL}?${params.toString()}`;

      console.log("🌐 Fetching MGNREGA data...");
      console.log(`   📍 State: ${stateFilter}`);
      console.log(`   📅 Year: ${targetYear || "ALL (April only)"}`);
      console.log(`   ⚡ Limit: 500 (optimized)`);

      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.records && Array.isArray(result.records)) {
        const records = result.records;

        console.log(`✅ Loaded ${records.length} records`);

        if (records.length > 0) {
          const districts = [...new Set(records.map((r) => r.district_name))]
            .length;
          console.log(`   🏘️  ${districts} districts`);
        }

        // Save to cache
        const timestamp = Date.now();
        storage.set(cacheKey, records);
        storage.set(cacheTimestampKey, timestamp);

        setData(records);
        setLastUpdated(new Date(timestamp));
        console.log(`💾 Cached for 4 hours`);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error(
        `❌ Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`,
        err.message
      );

      // Retry logic
      if (retryCount < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`🔄 Retrying in ${delay / 1000}s...`);
        setTimeout(() => fetchData(forceRefresh, retryCount + 1), delay);
        return;
      }

      // Fallback to stale cache
      const cachedData = storage.get(cacheKey);
      const cachedTimestamp = storage.get(cacheTimestampKey);

      if (cachedData) {
        console.log("📦 Using stale cache as fallback");
        setData(cachedData);
        setLastUpdated(new Date(cachedTimestamp));
        setError("Using cached data (API unavailable)");
      } else {
        setError("Unable to load data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [stateFilter, yearFilter]);

  return { data, loading, error, lastUpdated, refetch: () => fetchData(true) };
}
