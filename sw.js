// Service worker: caches the app shell (HTML/JS/icons) so the UI loads
// offline. Firebase data calls always go to the network — this never
// caches API/data responses, only static files.

const CACHE_NAME = "dod-shell-v1";
const SHELL_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./src/constants.js",
    "./src/utils.js",
    "./src/firebase-helpers.js",
    "./src/App.js",
    "./src/components/Clock.js",
    "./src/components/Header.js",
    "./src/components/Footer.js",
    "./src/components/SetEditors.js",
    "./src/components/ExerciseCard.js",
    "./src/components/AddExerciseModal.js",
    "./src/components/CopyFromOtherUser.js",
    "./src/components/UserDashboard.js",
    "./src/components/HistoryView.js",
    "./src/components/ProfileView.js",
    "./src/components/PRView.js",
    "./src/components/SplitsView.js",
    "./src/components/SplitEditor.js",
    "./icon-192.png",
    "./icon-512.png",
    "./header-logo.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {
            // Some shell files (e.g. icons not yet added) may be missing on
            // first deploy; don't fail install over that.
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Only ever cache same-origin, GET, http(s) requests. The Cache API
    // throws on POST requests and on non-http(s) schemes (e.g. requests
    // injected by browser extensions show up as chrome-extension://),
    // and Firebase's own traffic is cross-origin anyway — none of that
    // should be touched here.
    if (
        url.origin !== self.location.origin ||
        event.request.method !== "GET" ||
        !url.protocol.startsWith("http")
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
