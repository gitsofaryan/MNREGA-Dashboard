import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date to Indian locale
export function formatDate(date) {
  return new Intl.DateTimeFormat("hi-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Format large numbers with commas (Indian style)
export function formatNumber(num) {
  if (!num && num !== 0) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
}

// Extract unique states from API data
export function extractStates(data) {
  if (!data || !Array.isArray(data)) return [];
  const states = [...new Set(data.map((item) => item.state_name))];
  return states.sort();
}

// Extract unique districts for a specific state
export function extractDistricts(data, stateName) {
  if (!data || !Array.isArray(data)) return [];
  const districts = data
    .filter((item) => item.state_name === stateName)
    .map((item) => item.district_name);
  return [...new Set(districts)].sort();
}

// Extract unique financial years from data
export function extractYears(data) {
  if (!data || !Array.isArray(data)) return [];
  const years = [...new Set(data.map((item) => item.fin_year))];
  return years.filter(Boolean).sort().reverse(); // Most recent first
}

// Generate financial years list (e.g., 2014-2015 ... 2025-2026)
export function generateFinancialYears(startYear = 2010) {
  const years = [];
  const now = new Date();
  // Indian FY: April (4) to March (3)
  const currentFYStartYear =
    now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  for (let y = startYear; y <= currentFYStartYear; y++) {
    years.push(`${y}-${y + 1}`);
  }
  // Latest first
  return years.reverse();
}

// Filter data by state and district
export function filterData(data, state, district) {
  if (!data || !Array.isArray(data)) return [];

  let filtered = data;

  if (state) {
    filtered = filtered.filter((item) => item.state_name === state);
  }

  if (district) {
    filtered = filtered.filter((item) => item.district_name === district);
  }

  return filtered;
}

// Calculate statistics from filtered data
export function calculateStats(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      totalJobCards: 0,
      totalWorkers: 0,
      activeWorkers: 0,
      totalHouseholds: 0,
      monthYear: "-",
    };
  }

  // Month order for proper sorting (April to March for financial year)
  const monthOrder = {
    April: 1,
    May: 2,
    June: 3,
    July: 4,
    August: 5,
    September: 6,
    October: 7,
    November: 8,
    December: 9,
    January: 10,
    February: 11,
    March: 12,
  };

  // For each district, keep track of the LATEST month's data
  // (MGNREGA data is cumulative, so we need the most recent month per district)
  const districtLatestData = {};

  data.forEach((item) => {
    const district = item.district_name;
    if (!district) return;

    const month = item.month;
    const monthNum = monthOrder[month] || 0;

    // If this is the first record for this district, or a later month, use it
    if (!districtLatestData[district]) {
      districtLatestData[district] = { ...item, monthNum };
    } else {
      const currentMonthNum = districtLatestData[district].monthNum;
      if (monthNum > currentMonthNum) {
        districtLatestData[district] = { ...item, monthNum };
      }
    }
  });

  // Sum up from latest month data for each district
  const latestRecords = Object.values(districtLatestData);

  console.log(
    `📊 Calculating stats from ${latestRecords.length} districts (latest month each)`
  );

  const stats = latestRecords.reduce(
    (acc, item) => {
      const jobCards = parseInt(item.Total_No_of_JobCards_issued) || 0;
      const workers = parseInt(item.Total_No_of_Workers) || 0;
      const activeWorkers = parseInt(item.Total_No_of_Active_Workers) || 0;
      const households = parseInt(item.Total_Households_Worked) || 0;

      return {
        totalJobCards: acc.totalJobCards + jobCards,
        totalWorkers: acc.totalWorkers + workers,
        activeWorkers: acc.activeWorkers + activeWorkers,
        totalHouseholds: acc.totalHouseholds + households,
      };
    },
    { totalJobCards: 0, totalWorkers: 0, activeWorkers: 0, totalHouseholds: 0 }
  );

  // Get month and year from the most recent record
  const sortedRecords = latestRecords.sort((a, b) => b.monthNum - a.monthNum);
  const latestRecord = sortedRecords[0];
  stats.monthYear = latestRecord
    ? `${latestRecord.month || ""} ${latestRecord.fin_year || ""}`
    : "-";

  console.log(`✅ Stats calculated:`, {
    districts: latestRecords.length,
    jobCards: stats.totalJobCards,
    workers: stats.totalWorkers,
    activeWorkers: stats.activeWorkers,
    households: stats.totalHouseholds,
    monthYear: stats.monthYear,
  });

  return stats;
}

// localStorage helper functions
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};
