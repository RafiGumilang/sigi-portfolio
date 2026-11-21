'use strict';

/*
 * SIGI Portfolio Offline Edition
 * Static-only app shell. No PHP endpoints, company databases, credentials,
 * or production records are cached or requested.
 */
const CACHE_NAME = 'sigi-portfolio-shell-v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './app.webmanifest',
  './assets/app.css',
  './assets/app.js',
  './assets/sigi-logo.png',
  './assets/sigi-pwa-192.png',
  './assets/sigi-pwa-512.png',
  './assets/sigi-pwa-maskable-512.png',
  './assets/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('sigi-portfolio-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // All app routes are hash routes served by the same local shell.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (_) {
        return (await cache.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const key = new URL(request.url).pathname.endsWith('/') ? './' : request;
    const cached = await cache.match(key) || await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === 'basic') cache.put(request, response.clone());
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});
