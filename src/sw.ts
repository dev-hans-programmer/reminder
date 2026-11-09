/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string }>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Time for a splash!',
    body: 'Cool water, three deep breaths, then come back refreshed.',
  }

  const payload = (() => {
    try {
      return { ...fallback, ...event.data?.json() }
    } catch {
      return { ...fallback, body: event.data?.text() || fallback.body }
    }
  })()

  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'splash-reminder',
    data: { url: '/' },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin)
    if (existing && 'focus' in existing) {
      await existing.focus()
      existing.postMessage({ type: 'SPLASH_NOTIFICATION_OPENED' })
      return
    }
    await self.clients.openWindow('/')
  })())
})

export {}
