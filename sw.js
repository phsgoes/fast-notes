const CACHE_NAME = 'quick-notes-cache-v1'
const urlsToCache = [
  'https://phsgoes.github.io/fast-notes/',
  'https://phsgoes.github.io/fast-notes/index.html',
  'https://phsgoes.github.io/fast-notes/main.css',
  'https://phsgoes.github.io/fast-notes/app.js',
  'https://phsgoes.github.io/fast-notes/pwa-install.js',
  'https://phsgoes.github.io/fast-notes/app.webmanifest',
  'https://phsgoes.github.io/fast-notes/img/favicon.ico',
  'https://phsgoes.github.io/fast-notes/img/icons/icon-128x128.png',
  'https://phsgoes.github.io/fast-notes/img/icons/icon-144x144.png',
  'https://phsgoes.github.io/fast-notes/img/icons/icon-192x192.png',
  'https://phsgoes.github.io/fast-notes/img/icons/icon-256x256.png',
  'https://phsgoes.github.io/fast-notes/img/icons/icon-512x512.png'
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