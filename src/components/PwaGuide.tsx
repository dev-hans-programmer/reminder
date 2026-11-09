import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, BellRing, Check, ChevronDown, Download, ExternalLink, Share2, Smartphone, SquarePlus, WifiOff, X } from 'lucide-react'
import { useFocusTrap } from '../application/useFocusTrap'
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
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [notificationState, setNotificationState] = useState<NotificationState>(() => getNotificationState())
  const installDialogRef = useRef<HTMLDivElement>(null)
  const closeInstallHelp = useCallback(() => setShowInstallHelp(false), [])
  useFocusTrap(installDialogRef, showInstallHelp, closeInstallHelp)
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
      if (!installed) setShowInstallHelp(true)
    } else {
      setShowInstallHelp(true)
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
        {!isInstalled && (
          <button className="primary-button" type="button" onClick={install}>
            {canInstall ? <Download size={18} /> : <Smartphone size={18} />}
            {canInstall ? 'Install app' : isIos ? 'Install on iPhone' : 'Show install steps'}
          </button>
        )}
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

      {showInstallHelp && createPortal((
        <div className="modal-backdrop install-help-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeInstallHelp()}>
          <div className="install-help-modal" role="dialog" aria-modal="true" aria-labelledby="install-help-title" ref={installDialogRef}>
            <button className="icon-button install-help-close" type="button" onClick={closeInstallHelp} aria-label="Close installation guide"><X size={19} /></button>
            <span className="install-help-icon" aria-hidden="true"><Smartphone size={28} /></span>
            <span className="eyebrow centered">Add Splash to your phone</span>
            <h2 id="install-help-title">{isIos ? 'Install from Safari' : 'Install from your browser'}</h2>
            <p className="install-help-intro">{isIos
              ? 'Apple requires Home Screen apps to be installed from Safari’s Share menu.'
              : 'Your browser has not offered its automatic installer. You can still add Splash from the browser menu.'}</p>

            <ol className="install-help-steps">
              <li><span>{isIos ? <Share2 size={18} /> : <ExternalLink size={18} />}</span><p><strong>{isIos ? 'Open Safari and tap Share' : 'Open in Chrome or Edge'}</strong><small>{isIos ? 'Use the square-with-arrow icon in Safari’s toolbar.' : 'Avoid an in-app browser such as Instagram or Gmail.'}</small></p></li>
              <li><span><SquarePlus size={18} /></span><p><strong>Choose “Add to Home Screen”</strong><small>{isIos ? 'Scroll down in the Share sheet if it is not immediately visible.' : 'It may instead be labelled “Install app.”'}</small></p></li>
              <li><span><BellRing size={18} /></span><p><strong>Launch Splash from its icon</strong><small>Return to this card and enable notifications inside the installed app.</small></p></li>
            </ol>

            <button className="primary-button install-help-done" type="button" onClick={closeInstallHelp}>Got it</button>
          </div>
        </div>
      ), document.body)}
    </section>
  )
}
