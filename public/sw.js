/* global self, caches, fetch */

const CACHE_NAME = "cashflow-static-v1";

const STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS)),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("cashflow-static-") &&
                cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => createOfflineResponse()),
    );

    return;
  }

  const isStaticAsset =
    requestUrl.origin === self.location.origin &&
    STATIC_ASSETS.includes(requestUrl.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse.ok) {
            return networkResponse;
          }

          const responseCopy = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseCopy);
          });

          return networkResponse;
        });
      }),
    );
  }
});

function createOfflineResponse() {
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="theme-color" content="#020617" />
        <title>CashFlow is offline</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #020617;
            color: #f8fafc;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          main {
            width: 100%;
            max-width: 440px;
            text-align: center;
          }

          .icon {
            display: grid;
            place-items: center;
            width: 64px;
            height: 64px;
            margin: 0 auto;
            border-radius: 18px;
            background: #1d4ed8;
            font-size: 30px;
          }

          h1 {
            margin: 24px 0 8px;
            font-size: 28px;
          }

          p {
            margin: 0;
            color: #cbd5e1;
            line-height: 1.6;
          }

          button {
            margin-top: 24px;
            border: 0;
            border-radius: 10px;
            padding: 12px 20px;
            background: #2563eb;
            color: #ffffff;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
          }

          button:hover {
            background: #1d4ed8;
          }
        </style>
      </head>

      <body>
        <main>
          <div class="icon" aria-hidden="true">↗</div>

          <h1>You’re offline</h1>

          <p>
            CashFlow needs an internet connection to securely load your
            financial data. No private account information is stored in the
            offline cache.
          </p>

          <button type="button" onclick="window.location.reload()">
            Try again
          </button>
        </main>
      </body>
    </html>
  `;

  return new Response(html, {
    status: 503,
    statusText: "Service Unavailable",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}