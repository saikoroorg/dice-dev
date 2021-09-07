// Service worker script for progressive web app.
const identifier = "dice10907";

// Prefetche files.
// (need to set relative path "./" or absolute path "/")
const prefetche = ["./index.html", "./manifest.json", "./icon.svg"];

// Event on installing service worker.
self.addEventListener("install", (evt) => {
    evt.waitUntil(caches.open(identifier)
                  .then((cache) => {

        // Prefetche files and activate.
        return cache.addAll(prefetche)
               .then(() => self.skipWaiting());
    }));
});

// Event on activating service worker.
self.addEventListener("activate", (evt) => {

    // Remove old cache if updated cache version.
    evt.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => {
            if (key != identifier) {
                return caches.delete(key);
            }
        }));
    }));
});

// Event on fetching network request.
self.addEventListener("fetch", (evt) => {
    evt.respondWith(

        // Return caches if matched the request.
        caches.match(evt.request.clone(), {ignoreSearch:true}).then((response) => {

            // Fetch if not found.
            return response || fetch(evt.request.clone()).then((response) => {

                // Cache refetched file.
                if (response.ok) {
                    var responseCache = response.clone();
                    caches.open(cacheName).then((cache) => {
                        cache.put(evt.request, responseCache);
                    });
                }

                // Return fetched file.
                return response;
            });
        })
    );
});
