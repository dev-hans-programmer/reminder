import { useCallback, useRef, useState } from 'react'
import { Bell, BellOff, Check, Play, SlidersHorizontal, Volume2, X } from 'lucide-react'
import { useFocusTrap } from '../application/useFocusTrap'
import { getActiveRoutine, SOUND_OPTIONS, updateRoutine, type Routine, type SoundId, type SplashSettings } from '../domain/settings'
import { getNotificationState, requestNotificationPermission, type NotificationState } from '../infrastructure/notificationService'

interface SettingsPanelProps {
  open: boolean
  settings: SplashSettings
  onClose: () => void
  onSave: (settings: SplashSettings) => void
  onPreviewSound: (sound: SoundId, volume: number) => void
}

const SOUND_LABELS: Record<SoundId, string> = {
  gentle: 'Gentle chime',
  ripple: 'Soft ripple',
  bright: 'Bright bell',
  off: 'No sound',
}

export function SettingsPanel({ open, settings, onClose, onSave, onPreviewSound }: SettingsPanelProps) {
  const [draft, setDraft] = useState(settings)
  const [notificationState, setNotificationState] = useState<NotificationState>(() => getNotificationState())
  const panelRef = useRef<HTMLDivElement>(null)
  const stableClose = useCallback(() => onClose(), [onClose])
  useFocusTrap(panelRef, open, stableClose)
  const activeRoutine = getActiveRoutine(draft)

  if (!open) return null

  const updateRoutineField = <K extends keyof Omit<Routine, 'id' | 'symbol'>>(key: K, value: Routine[K]) => {
    setDraft((current) => updateRoutine(current, current.activeRoutineId, { [key]: value }))
  }

  const enableNotifications = async () => setNotificationState(await requestNotificationPermission())
  const notificationCopy = notificationState === 'granted'
    ? 'Browser reminders are enabled.'
    : notificationState === 'denied'
      ? 'Blocked in browser settings.'
      : notificationState === 'unsupported'
        ? 'Not supported by this browser.'
        : 'Get a reminder when this tab is in the background.'

  return (
    <div className="modal-backdrop settings-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" ref={panelRef}>
        <div className="settings-header">
          <div>
            <span className="eyebrow"><SlidersHorizontal size={14} /> Make it yours</span>
            <h2 id="settings-title">Your routine rhythm</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings"><X size={20} /></button>
        </div>

        <div className="settings-content">
          <section className="setting-group">
            <div className="setting-label"><span>Active routine</span><strong>{activeRoutine.symbol} {activeRoutine.name}</strong></div>
            <div className="settings-routine-grid">
              {draft.routines.map((routine) => (
                <button
                  type="button"
                  key={routine.id}
                  className={draft.activeRoutineId === routine.id ? 'settings-routine active' : 'settings-routine'}
                  onClick={() => setDraft((current) => ({ ...current, activeRoutineId: routine.id }))}
                  aria-pressed={draft.activeRoutineId === routine.id}
                >
                  <span aria-hidden="true">{routine.symbol}</span>
                  {routine.name}
                </button>
              ))}
            </div>
          </section>

          <section className="setting-group">
            <div className="setting-label"><span>Reminder interval</span><strong>{activeRoutine.intervalMinutes} min</strong></div>
            <input
              className="range-input"
              type="range"
              min="1"
              max="60"
              step="1"
              value={activeRoutine.intervalMinutes}
              onChange={(event) => updateRoutineField('intervalMinutes', Number(event.target.value))}
              aria-label="Reminder interval in minutes"
            />
            <div className="range-scale"><span>1 min</span><span>30 min</span><span>60 min</span></div>
            <label className="number-field">Custom interval
              <input type="number" min="1" max="180" value={activeRoutine.intervalMinutes} onChange={(event) => updateRoutineField('intervalMinutes', Math.min(180, Math.max(1, Number(event.target.value))))} />
              <span>minutes</span>
            </label>
          </section>

          <section className="setting-group">
            <label className="field-label">Routine name
              <input type="text" maxLength={30} value={activeRoutine.name} onChange={(event) => updateRoutineField('name', event.target.value)} />
            </label>
            <label className="field-label">Reminder title
              <input type="text" maxLength={60} value={activeRoutine.reminderTitle} onChange={(event) => updateRoutineField('reminderTitle', event.target.value)} />
            </label>
            <label className="field-label">Encouraging message
              <textarea maxLength={160} rows={3} value={activeRoutine.reminderMessage} onChange={(event) => updateRoutineField('reminderMessage', event.target.value)} />
            </label>
          </section>

          <section className="setting-group">
            <div className="setting-label"><span>Sound</span><Volume2 size={18} /></div>
            <div className="sound-grid">
              {SOUND_OPTIONS.map((sound) => (
                <button
                  className={activeRoutine.sound === sound ? 'sound-option selected' : 'sound-option'}
                  type="button"
                  key={sound}
                  onClick={() => updateRoutineField('sound', sound)}
                  aria-pressed={activeRoutine.sound === sound}
                >
                  {activeRoutine.sound === sound && <Check size={14} />}
                  {SOUND_LABELS[sound]}
                </button>
              ))}
            </div>
            <div className="volume-row">
              <span>Volume</span>
              <input type="range" min="0" max="1" step="0.05" value={activeRoutine.volume} onChange={(event) => updateRoutineField('volume', Number(event.target.value))} aria-label="Reminder volume" />
              <button className="preview-button" type="button" disabled={activeRoutine.sound === 'off'} onClick={() => onPreviewSound(activeRoutine.sound, activeRoutine.volume)}><Play size={14} fill="currentColor" /> Preview</button>
            </div>
          </section>

          <section className="setting-group notification-setting">
            <div className="notification-icon" aria-hidden="true">{notificationState === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}</div>
            <div><strong>Background notifications</strong><p>{notificationCopy}</p></div>
            {notificationState === 'default' && <button type="button" onClick={enableNotifications}>Enable</button>}
          </section>

          <label className="toggle-row">
            <span><strong>Reduce visual motion</strong><small>Keep the water calm and still.</small></span>
            <input type="checkbox" checked={draft.reduceMotion} onChange={(event) => setDraft((current) => ({ ...current, reduceMotion: event.target.checked }))} />
          </label>
        </div>

        <div className="settings-footer">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="button" onClick={() => onSave(draft)}><Check size={18} /> Save changes</button>
        </div>
      </aside>
    </div>
  )
}
