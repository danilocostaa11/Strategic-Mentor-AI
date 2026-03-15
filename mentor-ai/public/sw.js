const CACHE_VERSION = "v3";
const STATIC_CACHE = `mentor-ai-static-${CACHE_VERSION}`;
const PAGES_CACHE = `mentor-ai-pages-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
    "/",
    "/offline",
    "/manifest.json",
    "/favicon.ico",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

function isStaticAsset(pathname) {
    return pathname.startsWith("/_next/static/")
        || /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|json|woff2?)$/i.test(pathname);
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key.startsWith("mentor-ai-"))
                    .filter((key) => ![STATIC_CACHE, PAGES_CACHE].includes(key))
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(event.request).catch(() =>
                new Response(JSON.stringify({ error: "offline", message: "Sem conexão de rede" }), {
                    headers: { "Content-Type": "application/json" },
                    status: 503,
                })
            )
        );
        return;
    }

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(PAGES_CACHE).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(async () => {
                    const cachedPage = await caches.match(event.request);
                    if (cachedPage) return cachedPage;
                    return caches.match("/offline");
                })
        );
        return;
    }

    if (isStaticAsset(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                const networkFetch = fetch(event.request)
                    .then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => cached);

                return cached || networkFetch;
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
