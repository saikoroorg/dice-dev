// Web app manifest for progressive web app.
const manifest = {
    "name": "Dice",
    "version": "0.8.10913i",
    "description": `<a href="dice/">Dice</a> is the web app that rolls dice by tapping. <a href="dice/?2d">2d</a> is for 2 dice. <a href="dice/?3d6">3d6</a> is for 3 dice. <a href="dice/?d8">d8</a> is for a die 8 sided. <a href="dice/?2d10">2d10</a> is for 2 dice 10 sided. <span class="note">"Add to Homescreen" to use like as native app.</span>`,
    "description_ja": `<a href="dice/">Dice</a>はタップでサイコロをふるウェブアプリです。<a href="dice/?2d">2d</a>は2つのサイコロです。<a href="dice/?3d6">3d6</a>は3つのサイコロです。<a href="dice/?d8">d8</a>は8面サイコロです。<a href="dice/?2d10">2d10</a>は2つの10面サイコロです。<span class="note">"ホーム画面に追加"をするとアプリのようにつかえます。</span>`,
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

// Script for service worker.
if (self != null) {
    const identifier = manifest.name + "/" + manifest.version;

    // Event on installing service worker.
    self.addEventListener("install", (evt) => {

        // Cache all contents.
        evt.waitUntil(caches.open(identifier).then((cache) => {

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
                if (key != identifier) {
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

            let res = new Response(JSON.stringify(manifest),
                {"status": 200, "statusText": "OK",
                 "headers": {"Content-Type": "application/json"}});
            evt.respondWith(res);

        // Returns the cache file that matches the request.
        } else {
            evt.respondWith(caches.match(reqCloned, {ignoreSearch: true}).then((res) => {

                // Fetch if not found.
                return res || fetch(reqCloned).then((res) => {

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
            }));
        }
    });
}
