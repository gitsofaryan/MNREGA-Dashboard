import { useState, useEffect } from "react";
import { storage } from "../lib/utils";

const API_URL =
  "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const API_KEY = "579b464db66ec23bdd00000151fc8e7dade948685e54b87d1aac6e9b";
const CACHE_DURATION = 1000 * 60 * 60 * 2; // 2 hours (increased from 30 min)
const MAX_RETRIES = 2; // Reduced retries
const RETRY_DELAY = 1500; // Faster retry
const INITIAL_LOAD_LIMIT = 500; // Load only recent data initially

// Get cache key based on filters
const getCacheKey = (state, year) => {
  return `mgnrega_${state}_${year || "all"}`;
};

const getCacheTimestampKey = (state, year) => {
  return `mgnrega_ts_${state}_${year || "all"}`;
};

// Fetch all data for a state (and optionally year)
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
      setLoading(true);
      setError(null);

      // Check cache first
      if (!forceRefresh) {
        const cachedData = storage.get(cacheKey);
        const cachedTimestamp = storage.get(cacheTimestampKey);

        if (cachedData && cachedTimestamp) {
          const cacheAge = Date.now() - cachedTimestamp;

          if (cacheAge < CACHE_DURATION) {
            console.log(
              `📦 Using cached data (${Math.round(cacheAge / 60000)} min old)`
            );
            setData(cachedData);
            setLastUpdated(new Date(cachedTimestamp));
            setLoading(false);
            return;
          }
        }
      }

      // Build API URL with filters
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: "10000", // Fetch ALL available records
        offset: "0",
      });

      // Add state filter
      if (stateFilter) {
        params.append("filters[state_name]", stateFilter);
      }

      // Add year filter if specified
      if (yearFilter) {
        params.append("filters[fin_year]", yearFilter);
      }

      const apiUrl = `${API_URL}?${params.toString()}`;

      console.log("🌐 Fetching MGNREGA data...");
      console.log(`   📍 State: ${stateFilter}`);
      console.log(`   � Year: ${yearFilter || "All years"}`);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      //   console.log(result)

      if (result && result.records && Array.isArray(result.records)) {
        const records = result.records;

        console.log(`✅ API Response:`);
        console.log(`   📊 Total available: ${result.total || "unknown"}`);
        console.log(`   ✓ Fetched: ${records.length} records`);

        if (records.length > 0) {
          const districts = [...new Set(records.map((r) => r.district_name))];
          const years = [...new Set(records.map((r) => r.fin_year))];

          console.log(
            `   🏘️  Districts: ${districts.length} (${districts.join(", ")})`
          );
          console.log(`   � Years: ${years.join(", ")}`);
        }

        // Save to cache
        const timestamp = Date.now();
        storage.set(cacheKey, records);
        storage.set(cacheTimestampKey, timestamp);

        setData(records);
        setLastUpdated(new Date(timestamp));
        console.log(`💾 Cached successfully!`);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error(
        `❌ Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`,
        err
      );

      // Retry with exponential backoff
      if (retryCount < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`🔄 Retrying in ${delay / 1000}s...`);
        setTimeout(() => fetchData(forceRefresh, retryCount + 1), delay);
        return;
      }

      // Use stale cache as fallback
      const cachedData = storage.get(cacheKey);
      const cachedTimestamp = storage.get(cacheTimestampKey);

      if (cachedData) {
        console.log("📦 Using stale cached data");
        setData(cachedData);
        setLastUpdated(new Date(cachedTimestamp));
        setError("Using cached data (API unavailable)");
      } else {
        setError("Unable to load data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [stateFilter, yearFilter]); // Re-fetch when state or year changes

  return { data, loading, error, lastUpdated, refetch: () => fetchData(true) };
}
