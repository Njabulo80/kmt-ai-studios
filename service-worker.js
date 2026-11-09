/* =====================================
   KMT AI STUDIOS
   SERVICE WORKER
   Offline Application Engine
===================================== */

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
   1. INSTALL APPLICATION CACHE
===================================== */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME).then(async cache => {

      await Promise.all(

        APP_FILES.map(async file => {

          try {

            await cache.add(file);

          } catch (error) {

            console.warn(
              "Could not cache:",
              file,
              error
            );

          }

        })

      );

    })

  );

  self.skipWaiting();

});


/* =====================================
   2. ACTIVATE NEW VERSION
===================================== */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys

          .filter(key =>

            key.startsWith("kmt-ai-studios-") &&
            key !== CACHE_NAME

          )

          .map(key => caches.delete(key))

      )

    ).then(() => self.clients.claim())

  );

});


/* =====================================
   3. HANDLE NETWORK REQUESTS
===================================== */

self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;


  /* ===================================
     PAGE NAVIGATION
  =================================== */

  if (request.mode === "navigate") {

    event.respondWith(

      fetch(request)

        .then(response => {

          if (response.ok) {

            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {

              cache.put("./index.html", copy);

            });

          }

          return response;

        })

        .catch(async () => {

          return await caches.match("./index.html") ||

            new Response(

              "KMT AI Studios is currently offline. Please reconnect to the internet.",

              {
                status: 503,

                headers: {
                  "Content-Type": "text/plain"
                }

              }

            );

        })

    );

    return;

  }


  /* ===================================
     APPLICATION FILES
  =================================== */

  event.respondWith(

    caches.match(request).then(cachedResponse => {

      if (cachedResponse) {

        return cachedResponse;

      }

      return fetch(request).then(response => {

        if (
          response.ok &&
          response.type === "basic"
        ) {

          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {

            cache.put(request, copy);

          });

        }

        return response;

      });

    })

  );

});


/* =====================================
   4. APPLICATION CACHE COMPLETE
===================================== */

console.log("KMT AI Studios service worker active.");

console.log("Active cache version:", CACHE_NAME);
