export type NotificationState = NotificationPermission | 'unsupported'

export function getNotificationState(): NotificationState {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission(): Promise<NotificationState> {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

async function showNotification(title: string, message: string, force: boolean) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || (!force && document.visibilityState === 'visible')) return false
  const options: NotificationOptions = {
    body: message,
    icon: '/pwa-192x192.png',
    tag: 'splash-reminder',
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, options)
    return true
  }

  const notification = new Notification(title, options)
  notification.onclick = () => window.focus()
  return true
}

export function sendReminderNotification(title: string, message: string) {
  return showNotification(title, message, false)
}

export function sendTestNotification() {
  return showNotification('Splash notifications are ready 💧', 'Your next reminder will appear like this while Splash can run in the background.', true)
}
