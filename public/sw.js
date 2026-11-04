/*
 * Minimal pass-through service worker.
 *
 * Chromium's install heuristics want a registered worker with a real fetch
 * handler. Caching is deliberately omitted: responses always come from the
 * network so Supabase sessions, RSC payloads, and dashboard data never go
 * stale. Only top-level navigations are intercepted.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || request.mode !== "navigate") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(fetch(request));
});
