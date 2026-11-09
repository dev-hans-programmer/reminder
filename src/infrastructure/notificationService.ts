export type NotificationState = NotificationPermission | 'unsupported'

export function getNotificationState(): NotificationState {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission(): Promise<NotificationState> {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

export function sendReminderNotification(title: string, message: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || document.visibilityState === 'visible') return
  const notification = new Notification(title, {
    body: message,
    icon: '/splash-icon.svg',
    tag: 'splash-reminder',
  })
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}
