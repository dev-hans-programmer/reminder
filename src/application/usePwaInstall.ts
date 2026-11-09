import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function getStandaloneState() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true
}

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(getStandaloneState)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isOfflineReady, setIsOfflineReady] = useState(false)
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleDisplayMode = () => setIsInstalled(getStandaloneState())
    const displayMode = window.matchMedia('(display-mode: standalone)')

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    displayMode.addEventListener('change', handleDisplayMode)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      displayMode.removeEventListener('change', handleDisplayMode)
    }
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let active = true
    void navigator.serviceWorker.ready.then(() => {
      if (active) setIsOfflineReady(true)
    })
    return () => { active = false }
  }, [])

  const install = useCallback(async () => {
    if (!installPrompt) return false
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)
    if (choice.outcome === 'accepted') setIsInstalled(true)
    return choice.outcome === 'accepted'
  }, [installPrompt])

  return {
    canInstall: installPrompt !== null,
    isInstalled,
    isIos,
    isOnline,
    isOfflineReady,
    install,
  }
}
