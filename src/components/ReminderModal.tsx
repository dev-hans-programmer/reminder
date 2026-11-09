import { useCallback, useRef } from 'react'
import { Check, Clock3 } from 'lucide-react'
import { useFocusTrap } from '../application/useFocusTrap'

interface ReminderModalProps {
  open: boolean
  title: string
  message: string
  symbol: string
  reduceMotion: boolean
  onComplete: () => void
  onSnooze: () => void
}

export function ReminderModal({ open, title, message, symbol, reduceMotion, onComplete, onSnooze }: ReminderModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const escapeToSnooze = useCallback(() => onSnooze(), [onSnooze])
  useFocusTrap(modalRef, open, escapeToSnooze)

  if (!open) return null

  return (
    <div className="modal-backdrop reminder-backdrop" role="presentation">
      <div className="reminder-modal" role="dialog" aria-modal="true" aria-labelledby="reminder-title" aria-describedby="reminder-message" ref={modalRef}>
        <div className={reduceMotion ? 'splash-illustration still' : 'splash-illustration'} aria-hidden="true">
          <span className="splash-ring ring-a" />
          <span className="splash-ring ring-b" />
          <span className="big-drop"><span className="reminder-symbol">{symbol}</span></span>
          <i className="speck s1" /><i className="speck s2" /><i className="speck s3" /><i className="speck s4" />
        </div>
        <span className="eyebrow centered">Your fresh moment is here</span>
        <h2 id="reminder-title">{title}</h2>
        <p id="reminder-message">{message}</p>
        <div className="reminder-actions">
          <button className="primary-button" type="button" onClick={onComplete}><Check size={19} /> I splashed!</button>
          <button className="secondary-button" type="button" onClick={onSnooze}><Clock3 size={18} /> Snooze 5 min</button>
        </div>
        <span className="escape-hint">Press Esc to snooze</span>
      </div>
    </div>
  )
}
