// Service worker script for progressive web app.
const version = "10908";

// Event on installing service worker.
self.addEventListener("install", (evt) => {

    // Cache contents.
    evt.waitUntil(caches.open(version).then((cache) => {

        // Contents to cache.
        // (need to set relative path "./" or absolute path "/")
        const contents = ["./index.html", "./manifest.json"];

        return cache.addAll(contents).then(() => self.skipWaiting());
    }));
});

// Event on activating service worker.
self.addEventListener("activate", (evt) => {

    // Delete old cache files when the cache version updated.
    evt.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => {
            if (key != version) {
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
                    caches.open(version).then((cache) => {
                        cache.put(evt.request, resCloned);
                    });
                }

                // Returns the fetched file.
                return res;
            });
        })
    );
});
