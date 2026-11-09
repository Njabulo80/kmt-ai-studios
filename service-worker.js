/* =====================================
   KMT AI STUDIOS
   SERVICE WORKER
   Offline Application Engine
   Founder: Njabulo Mbhodziya Dlamini
===================================== */

"use strict";

/* =====================================
   1. APPLICATION CACHE SETTINGS
===================================== */

// IMPORTANT: Increase this version whenever
// major application files are updated.

const CACHE_NAME = "kmt-ai-studios-v5";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg"
];


/* =====================================
   2. INSTALL APPLICATION CACHE
===================================== */

self.addEventListener("install", event => {

  event.waitUntil(

    (async () => {

      const cache = await caches.open(CACHE_NAME);

      await Promise.all(

        APP_FILES.map(async file => {

          try {

            // Request the latest file instead of
            // relying on an older browser cache.

            const response = await fetch(file, {
              cache: "reload"
            });

            if (!response.ok) {
              throw new Error(
                "HTTP error: " + response.status
              );
            }

            await cache.put(file, response);

            console.log("KMT cached:", file);

          }

          catch (error) {

            console.warn(
              "Could not cache application file:",
              file,
              error
            );

          }

        })

      );

      console.log("KMT application cache installed.");

      await self.skipWaiting();

    })()

  );

});


/* =====================================
   3. ACTIVATE NEW APPLICATION VERSION
===================================== */

self.addEventListener("activate", event => {

  event.waitUntil(

    (async () => {

      const cacheKeys = await caches.keys();

      await Promise.all(

        cacheKeys.map(async key => {

          if (
            key.startsWith("kmt-ai-studios-") &&
            key !== CACHE_NAME
          ) {

            await caches.delete(key);

            console.log(
              "Removed old KMT cache:",
              key
            );

          }

        })

      );

      await self.clients.claim();

      console.log(
        "KMT service worker activated:",
        CACHE_NAME
      );

    })()

  );

});


/* =====================================
   4. HANDLE NETWORK REQUESTS
===================================== */

self.addEventListener("fetch", event => {

  const request = event.request;

  // Only handle GET requests.

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Ignore external websites.

  if (url.origin !== self.location.origin) {
    return;
  }


  event.respondWith(

    (async () => {

      const cache = await caches.open(CACHE_NAME);

      // NETWORK FIRST:
      // Always attempt to retrieve the latest
      // application file from GitHub Pages.

      try {

        const networkResponse = await fetch(
          request,
          { cache: "no-store" }
        );

        if (networkResponse.ok) {

          const responseCopy = networkResponse.clone();

          let cacheKey = request;

          // Keep the offline homepage available.

          if (request.mode === "navigate") {
            cacheKey = "./index.html";
          }

          await cache.put(cacheKey, responseCopy);

        }

        return networkResponse;

      }

      catch (error) {

        console.warn(
          "KMT is using offline cache:",
          request.url
        );

        // If the internet is unavailable,
        // use the previously saved application file.

        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // If the homepage is requested offline,
        // try the cached index.html file.

        if (request.mode === "navigate") {

          const offlinePage = await cache.match(
            "./index.html"
          );

          if (offlinePage) {
            return offlinePage;
          }

        }

        return new Response(
          "KMT AI Studios is currently offline. Please reconnect to the internet.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain"
            }
          }
        );

      }

    })()

  );

});


/* =====================================
   5. APPLICATION STATUS
===================================== */

console.log("KMT AI Studios service worker loaded.");

console.log("Active cache version:", CACHE_NAME);
