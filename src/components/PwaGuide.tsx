import { useEffect, useState } from 'react'
import { Bell, Check, ChevronDown, Download, ExternalLink, Smartphone, WifiOff } from 'lucide-react'
import { getNotificationState, requestNotificationPermission, sendTestNotification, type NotificationState } from '../infrastructure/notificationService'

interface PwaGuideProps {
  canInstall: boolean
  isInstalled: boolean
  isIos: boolean
  isOnline: boolean
  isOfflineReady: boolean
  onInstall: () => Promise<boolean>
}

export function PwaGuide({ canInstall, isInstalled, isIos, isOnline, isOfflineReady, onInstall }: PwaGuideProps) {
  const [expanded, setExpanded] = useState(false)
  const [notificationState, setNotificationState] = useState<NotificationState>(() => getNotificationState())
  const notificationsReady = notificationState === 'granted'

  useEffect(() => {
    const refresh = () => setNotificationState(getNotificationState())
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  const enableNotifications = async () => {
    const state = await requestNotificationPermission()
    setNotificationState(state)
    if (state === 'granted') await sendTestNotification()
  }

  const install = async () => {
    if (canInstall) {
      const installed = await onInstall()
      if (!installed) setExpanded(true)
    } else {
      setExpanded(true)
    }
  }

  return (
    <section className="pwa-guide" aria-labelledby="pwa-title">
      <div className="pwa-copy">
        <span className="pwa-icon" aria-hidden="true"><Smartphone size={23} /></span>
        <div>
          <span className="eyebrow">Splash on your phone</span>
          <h2 id="pwa-title">Install it. Keep your reset close.</h2>
          <p>Get an app icon, offline access, and system notifications while Splash is allowed to run.</p>
        </div>
      </div>

      <div className="readiness-steps">
        <div className={isInstalled ? 'readiness-item ready' : 'readiness-item'}>
          <span>{isInstalled ? <Check size={15} /> : '1'}</span>
          <p><strong>{isInstalled ? 'App installed' : 'Install Splash'}</strong><small>{isInstalled ? 'Running in app mode' : 'Add it to your Home Screen'}</small></p>
        </div>
        <div className={notificationsReady ? 'readiness-item ready' : 'readiness-item'}>
          <span>{notificationsReady ? <Check size={15} /> : '2'}</span>
          <p><strong>{notificationsReady ? 'Notifications on' : 'Allow notifications'}</strong><small>{notificationsReady ? 'Phone alerts are enabled' : 'Required for phone alerts'}</small></p>
        </div>
        <div className={isOfflineReady ? 'readiness-item ready' : 'readiness-item'}>
          <span>{isOfflineReady ? <Check size={15} /> : <WifiOff size={14} />}</span>
          <p><strong>{isOfflineReady ? 'Offline ready' : 'Preparing offline mode'}</strong><small>{isOnline ? 'App shell cached locally' : 'You are currently offline'}</small></p>
        </div>
      </div>

      <div className="pwa-actions">
        {!isInstalled && <button className="primary-button" type="button" onClick={install}><Download size={18} /> Install app</button>}
        {isInstalled && notificationState === 'default' && <button className="primary-button" type="button" onClick={enableNotifications}><Bell size={18} /> Enable notifications</button>}
        {notificationsReady && <button className="secondary-button" type="button" onClick={() => void sendTestNotification()}><Bell size={17} /> Test notification</button>}
        <button className="guide-toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
          Setup guide <ChevronDown size={16} className={expanded ? 'rotated' : ''} />
        </button>
      </div>

      {expanded && (
        <div className="install-instructions">
          <div>
            <strong>{isIos ? 'On iPhone or iPad' : 'On Android or desktop'}</strong>
            <p>{isIos
              ? 'Open this site in Safari, tap Share, choose “Add to Home Screen,” then launch Splash from its new icon. Enable notifications inside the installed app.'
              : 'Use Install app above or your browser menu’s “Install app” option. Launch Splash from its new icon, then allow notifications.'}</p>
          </div>
          <div className="reliability-note">
            <ExternalLink size={16} />
            <p><strong>About closed-app reminders</strong> Mobile operating systems may suspend local web timers. Keep Splash open or backgrounded for the current timer; guaranteed alerts after it is fully closed require a server-powered Web Push service.</p>
          </div>
        </div>
      )}
    </section>
  )
}
