// Service worker script for progressive web app.
const identifier = "dice10907";

// Contents to cache.
// (need to set relative path "./" or absolute path "/")
const contents = ["./index.html", "./manifest.json"];

// Event on installing service worker.
self.addEventListener("install", (evt) => {
    evt.waitUntil(caches.open(identifier).then((cache) => {

        // Cache contents.
        return cache.addAll(contents).then(() => self.skipWaiting());
    }));
});

// Event on activating service worker.
self.addEventListener("activate", (evt) => {

    // Delete old cache files when the cache version updated.
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

        // Returns the cache file that matches the request.
        caches.match(evt.request.clone(), {ignoreSearch:true}).then((res) => {

            // Fetch if not found.
            return res || fetch(evt.request.clone()).then((res) => {

                // Cache the fetched file.
                if (res.ok) {
                    let resCloned = res.clone();
                    caches.open(identifier).then((cache) => {
                        cache.put(evt.request, resCloned);
                    });
                }

                // Returns the fetched file.
                return res;
            });
        })
    );
});
