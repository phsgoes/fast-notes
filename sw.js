const CACHE_NAME = 'fast-notes-cache-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/main.css',
  '/app.js',
  '/pwa-install.js',
  '/app.webmanifest',
  '/img/favicon.ico',
  '/img/icons/icon-128x128.png',
  '/img/icons/icon-144x144.png',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-256x256.png',
  '/img/icons/icon-512x512.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response
        return fetch(event.request)
      }
    )
  )
})