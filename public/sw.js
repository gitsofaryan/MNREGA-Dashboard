// MGNREGA Service Worker - Offline First Strategy
// This enables the app to work without internet connection

const CACHE_NAME = "mgnrega-v1";
const API_CACHE_NAME = "mgnrega-api-v1";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Resources to cache immediately on install
const STATIC_RESOURCES = ["/", "/index.html", "/manifest.json"];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static resources");
      return cache.addAll(STATIC_RESOURCES);
    })
  );

  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests (data.gov.in)
  if (url.origin.includes("data.gov.in")) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(handleStaticRequest(request));
});

// Network-first strategy for API requests
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone and cache the response
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error("Network response not ok");
  } catch (error) {
    // Network failed, try cache
    console.log("[SW] Network failed, using cache for:", request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "No internet connection. Showing cached data.",
        records: [],
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 503,
      }
    );
  }
}

// Cache-first strategy for static resources
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Failed to fetch:", request.url);

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlineResponse = await cache.match("/index.html");
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

// Background sync for data updates
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-mgnrega-data") {
    console.log("[SW] Background sync triggered");
    event.waitUntil(syncMGNREGAData());
  }
});

// Sync MGNREGA data in background
async function syncMGNREGAData() {
  try {
    // This would fetch latest data from API
    console.log("[SW] Syncing MGNREGA data...");
    // Implementation depends on your API structure
  } catch (error) {
    console.error("[SW] Sync failed:", error);
  }
}

// Push notification support (for future updates)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New MGNREGA data available",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [200, 100, 200],
    tag: "mgnrega-update",
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification("MGNREGA Dashboard", options)
  );
});
