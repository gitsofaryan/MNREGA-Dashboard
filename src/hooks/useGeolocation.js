import { useState, useEffect } from "react";
import { storage } from "../lib/utils";

const LOCATION_CACHE_KEY = "user_location";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = () => {
    // Check cache first
    const cachedLocation = storage.get(LOCATION_CACHE_KEY);
    if (cachedLocation) {
      setLocation(cachedLocation);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        try {
          // Reverse geocode to get district name
          console.log(
            `📍 Detected coordinates: ${coords.latitude}, ${coords.longitude}`
          );

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`
          );

          const data = await response.json();
          console.log("🗺️ Geocoding response:", data);

          // Extract district from address
          const address = data.address || {};
          const district =
            address.county ||
            address.state_district ||
            address.district ||
            address.city ||
            address.town ||
            "Unknown";

          const locationData = {
            ...coords,
            district: district
              .replace(" district", "")
              .replace(" District", "")
              .toUpperCase(),
            state: address.state || "Unknown",
            fullAddress: data.display_name || "",
          };

          console.log(`✅ Detected district: ${locationData.district}`);

          // Save to cache
          storage.set(LOCATION_CACHE_KEY, locationData);
          setLocation(locationData);
        } catch (err) {
          console.error("Geocoding error:", err);
          // Still save coordinates even if geocoding fails
          storage.set(LOCATION_CACHE_KEY, coords);
          setLocation(coords);
        }

        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  // Auto-detect on mount
  useEffect(() => {
    const cachedLocation = storage.get(LOCATION_CACHE_KEY);
    if (cachedLocation) {
      setLocation(cachedLocation);
    }
  }, []);

  return { location, loading, error, detectLocation };
}
