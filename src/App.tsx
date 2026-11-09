import { useCallback, useEffect, useState } from 'react'
import { CloudSun, ShieldCheck, Zap } from 'lucide-react'
import { useSettings } from './application/useSettings'
import { useSplashTimer } from './application/useSplashTimer'
import { usePwaInstall } from './application/usePwaInstall'
import { Header } from './components/Header'
import { PwaGuide } from './components/PwaGuide'
import { ReminderModal } from './components/ReminderModal'
import { SettingsPanel } from './components/SettingsPanel'
import { TimerHero } from './components/TimerHero'
import { getActiveRoutine, updateRoutine, type RoutineId, type SplashSettings } from './domain/settings'
import { playSound, startReminderSound, stopReminderSound, unlockAudio } from './infrastructure/audioService'
import { localSettingsRepository, localTimerRepository } from './infrastructure/localRepository'
import { sendReminderNotification } from './infrastructure/notificationService'

function App() {
  const { settings, updateSettings } = useSettings(localSettingsRepository)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const activeRoutine = getActiveRoutine(settings)
  const durationMs = activeRoutine.intervalMinutes * 60_000
  const pwa = usePwaInstall()

  const handleRing = useCallback(() => {
    startReminderSound(activeRoutine.sound, activeRoutine.volume)
    void sendReminderNotification(activeRoutine.reminderTitle, activeRoutine.reminderMessage)
    document.title = `${activeRoutine.symbol} ${activeRoutine.reminderTitle}`
  }, [activeRoutine])

  const timer = useSplashTimer({
    durationMs,
    repository: localTimerRepository,
    onRing: handleRing,
  })
  const snooze = timer.snooze

  useEffect(() => {
    if (timer.snapshot.status !== 'ringing') document.title = 'Splash — your tiny reset ritual'
  }, [timer.snapshot.status])

  useEffect(() => {
    if (timer.snapshot.status !== 'ringing') {
      stopReminderSound()
      return
    }
    return stopReminderSound
  }, [timer.snapshot.status])

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? 'true' : 'false'
  }, [settings.reduceMotion])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(''), 2500)
    return () => window.clearTimeout(id)
  }, [notice])

  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const start = useCallback(() => {
    unlockAudio()
    timer.start()
  }, [timer])

  const chooseInterval = useCallback((minutes: number) => {
    updateSettings(updateRoutine(settings, activeRoutine.id, { intervalMinutes: minutes }))
    timer.reset(minutes * 60_000)
    setNotice(`Reset to a ${minutes} minute rhythm`)
  }, [activeRoutine.id, settings, timer, updateSettings])

  const chooseRoutine = useCallback((routineId: RoutineId) => {
    if (routineId === settings.activeRoutineId) return
    const nextRoutine = settings.routines.find((routine) => routine.id === routineId)
    if (!nextRoutine) return
    updateSettings({ ...settings, activeRoutineId: routineId })
    timer.reset(nextRoutine.intervalMinutes * 60_000)
    setNotice(`${nextRoutine.name} routine is ready`)
  }, [settings, timer, updateSettings])

  const saveSettings = useCallback((next: SplashSettings) => {
    const nextRoutine = getActiveRoutine(next)
    const routineChanged = next.activeRoutineId !== settings.activeRoutineId
    const intervalChanged = nextRoutine.intervalMinutes !== activeRoutine.intervalMinutes
    updateSettings(next)
    if (routineChanged || intervalChanged) timer.reset(nextRoutine.intervalMinutes * 60_000)
    setSettingsOpen(false)
    setNotice(routineChanged || intervalChanged ? `Saved — ${nextRoutine.name} is ready` : 'Settings saved')
  }, [activeRoutine.intervalMinutes, settings.activeRoutineId, timer, updateSettings])

  const snoozeFiveMinutes = useCallback(() => snooze(5), [snooze])

  return (
    <div className="app-shell">
      <div className="ambient-shape shape-one" aria-hidden="true" />
      <div className="ambient-shape shape-two" aria-hidden="true" />
      <Header onOpenSettings={openSettings} />

      <TimerHero
        snapshot={timer.snapshot}
        durationMs={durationMs}
        routines={settings.routines}
        activeRoutine={activeRoutine}
        onStart={start}
        onPause={timer.pause}
        onReset={timer.reset}
        onSkip={timer.skip}
        onChooseInterval={chooseInterval}
        onChooseRoutine={chooseRoutine}
      />

      <PwaGuide
        canInstall={pwa.canInstall}
        isInstalled={pwa.isInstalled}
        isIos={pwa.isIos}
        isOnline={pwa.isOnline}
        isOfflineReady={pwa.isOfflineReady}
        onInstall={pwa.install}
      />

      <section className="benefit-strip" aria-label="About Splash">
        <div><span><Zap size={17} /></span><p><strong>Drift-resistant</strong><small>Stays on time, even after a tab nap.</small></p></div>
        <div><span><CloudSun size={17} /></span><p><strong>Gentle by design</strong><small>No accounts, pressure, or noisy clutter.</small></p></div>
        <div><span><ShieldCheck size={17} /></span><p><strong>Private & local</strong><small>Your preferences stay on this device.</small></p></div>
      </section>

      <footer>
        <span>Made for calmer, fresher workdays.</span>
        <button type="button" onClick={openSettings}>Customize your ritual</button>
      </footer>

      {settingsOpen && (
        <SettingsPanel
          open
          settings={settings}
          onClose={closeSettings}
          onSave={saveSettings}
          onPreviewSound={(sound, volume) => playSound(sound, volume)}
        />
      )}

      <ReminderModal
        open={timer.snapshot.status === 'ringing'}
        title={activeRoutine.reminderTitle}
        message={activeRoutine.reminderMessage}
        symbol={activeRoutine.symbol}
        reduceMotion={settings.reduceMotion}
        onComplete={timer.complete}
        onSnooze={snoozeFiveMinutes}
      />

      <div className={notice ? 'toast visible' : 'toast'} role="status" aria-live="polite">{notice}</div>
    </div>
  )
}

export default App
