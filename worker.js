// Service worker script for progressive web app.
const version = "dice10912a";

const manifest = {
    "name": "Dice",
    "short_name": "Dice",
    "background_color": "#fff",
    "theme_color": "#fff",
    "icons": [{
        "src": "./icon.svg",
        "sizes": "80x80",
        "type": "image/svg"
    }],
    "start_url": "./?app",
    "scope": "/dice/",
    "display": "standalone"
};

// Event on installing service worker.
self.addEventListener("install", (evt) => {

    // Cache all contents.
    evt.waitUntil(caches.open(version).then((cache) => {

        // Contents to cache.
        // (need to set relative path "./" or absolute path "/")
        const contents = ["./"];
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

    // Returns manifest.
    let reqCloned = evt.request.clone();
    if (reqCloned.url.match("manifest.json$")) {

        let res = new Response({"status" : 200 , "body" : manifest});
        evt.respondWith(null, res);

    // Returns the cache file that matches the request.
    } else {
        evt.respondWith(caches.match(reqCloned, {ignoreSearch:true}).then((res) => {

            // Fetch if not found.
            return res || fetch(reqCloned).then((res) => {

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
        }));
    }
});
