const CACHE_NAME =
    "lifelog-v5";


const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./database.js",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"
];

// =========================================================
// 安裝 Service Worker
// =========================================================

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    function(cache) {

                        return cache.addAll(
                            APP_FILES
                        );

                    }
                )

        );

        self.skipWaiting();

    }
);


// =========================================================
// 啟用 Service Worker
// =========================================================

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function(cacheNames) {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    function(name) {

                                        return (
                                            name !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    function(name) {

                                        return caches.delete(
                                            name
                                        );

                                    }
                                )

                        );

                    }
                )

        );

        self.clients.claim();

    }
);


// =========================================================
// 離線讀取
// =========================================================

self.addEventListener(
    "fetch",
    function(event) {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    function(cachedResponse) {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        return fetch(
                            event.request
                        );

                    }
                )

        );

    }
);