// Location detection service with fallback strategies
// Uses: 1) Browser Geolocation, 2) IP-based geolocation, 3) Manual selection

const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";
const IPAPI_ENDPOINT = "https://ipapi.co/json/";

/**
 * Get user's location using browser Geolocation API
 * @returns {Promise<{lat: number, lon: number}>}
 */
export async function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Reverse geocode coordinates to get district/state
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{district: string, state: string, country: string}>}
 */
export async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `${NOMINATIM_API}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "MGNREGA-BuildForBharat/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      district: address.state_district || address.county || address.city || "",
      state: address.state || "",
      country: address.country || "",
      fullAddress: data.display_name || "",
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    throw error;
  }
}

/**
 * Get approximate location using IP address (fallback)
 * @returns {Promise<{district: string, state: string, country: string}>}
 */
export async function getIPBasedLocation() {
  try {
    const response = await fetch(IPAPI_ENDPOINT);

    if (!response.ok) {
      throw new Error("IP geolocation failed");
    }

    const data = await response.json();

    return {
      district: data.region || "",
      state: data.region || "",
      country: data.country_name || "",
      city: data.city || "",
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch (error) {
    console.error("IP-based location error:", error);
    throw error;
  }
}

/**
 * Main location detection with fallback chain
 * @returns {Promise<{district: string, state: string, method: string}>}
 */
export async function detectUserLocation() {
  console.log("📍 Starting location detection...");

  try {
    // Try browser geolocation first (most accurate)
    console.log("1️⃣ Trying browser geolocation...");
    const coords = await getBrowserLocation();
    console.log(`✅ Got coordinates: ${coords.lat}, ${coords.lon}`);

    const location = await reverseGeocode(coords.lat, coords.lon);
    console.log(`✅ Reverse geocoded: ${location.district}, ${location.state}`);

    return {
      ...location,
      lat: coords.lat,
      lon: coords.lon,
      accuracy: coords.accuracy,
      method: "GPS",
    };
  } catch (gpsError) {
    console.warn("⚠️ GPS location failed:", gpsError.message);

    try {
      // Fallback to IP-based location
      console.log("2️⃣ Falling back to IP-based location...");
      const ipLocation = await getIPBasedLocation();
      console.log(
        `✅ IP location: ${ipLocation.district}, ${ipLocation.state}`
      );

      return {
        ...ipLocation,
        method: "IP",
      };
    } catch (ipError) {
      console.error("❌ All location methods failed:", ipError.message);
      throw new Error("Unable to detect location. Please select manually.");
    }
  }
}

/**
 * Match detected location to available MGNREGA districts
 * @param {string} detectedDistrict
 * @param {Array<string>} availableDistricts
 * @returns {string|null}
 */
export function matchDistrict(detectedDistrict, availableDistricts) {
  if (
    !detectedDistrict ||
    !availableDistricts ||
    availableDistricts.length === 0
  ) {
    return null;
  }

  const normalized = detectedDistrict.toUpperCase().trim();

  // Try exact match first
  let match = availableDistricts.find(
    (d) => d.toUpperCase().trim() === normalized
  );
  if (match) return match;

  // Try partial match
  match = availableDistricts.find((d) => {
    const districtUpper = d.toUpperCase().trim();
    return (
      districtUpper.includes(normalized) ||
      normalized.includes(districtUpper) ||
      // Remove common suffixes and try again
      districtUpper.replace(" DISTRICT", "").replace(" ZILA", "") ===
        normalized.replace(" DISTRICT", "").replace(" ZILA", "")
    );
  });

  return match || null;
}
