import { Pause, Play, RotateCcw, SkipForward, Sparkles } from 'lucide-react'
import { formatDuration, type TimerSnapshot } from '../domain/timer'

interface TimerHeroProps {
  snapshot: TimerSnapshot
  durationMs: number
  intervalMinutes: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onChooseInterval: (minutes: number) => void
}

const PRESETS = [10, 15, 20, 30]

export function TimerHero({
  snapshot,
  durationMs,
  intervalMinutes,
  onStart,
  onPause,
  onReset,
  onSkip,
  onChooseInterval,
}: TimerHeroProps) {
  const progress = Math.min(1, Math.max(0, snapshot.remainingMs / durationMs))
  const circumference = 2 * Math.PI * 138
  const nextTime = snapshot.deadline
    ? new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(snapshot.deadline)
    : 'Not scheduled'
  const isRunning = snapshot.status === 'running'
  const statusLabel = snapshot.status === 'idle' ? 'Ready when you are' : snapshot.status === 'paused' ? 'Paused' : isRunning ? 'Flow in progress' : 'Splash time'

  return (
    <main className="hero" id="top">
      <section className="hero-copy" aria-labelledby="page-title">
        <span className="eyebrow"><Sparkles size={14} /> A tiny ritual for brighter focus</span>
        <h1 id="page-title">Pause. Splash.<br /><em>Come back fresh.</em></h1>
        <p className="hero-lede">A gentle nudge to step away, splash some water, and reset your day—one refreshing moment at a time.</p>

        <div className="interval-picker" aria-label="Quick interval selection">
          <span>Remind me every</span>
          <div className="preset-row">
            {PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={intervalMinutes === minutes ? 'preset active' : 'preset'}
                onClick={() => onChooseInterval(minutes)}
                aria-pressed={intervalMinutes === minutes}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>

        <div className="session-note">
          <span className="session-icon" aria-hidden="true">✦</span>
          <p><strong>{snapshot.completedCount === 0 ? 'Your first reset is waiting.' : `${snapshot.completedCount} reset${snapshot.completedCount === 1 ? '' : 's'} completed.`}</strong><br />Small pauses can make room for better work.</p>
        </div>
      </section>

      <section className="timer-card" aria-label="Splash timer">
        <div className="timer-card-glow" aria-hidden="true" />
        <div className="timer-topline">
          <span className={`status-dot ${isRunning ? 'live' : ''}`} aria-hidden="true" />
          <span>{statusLabel}</span>
        </div>

        <div className="timer-dial">
          <svg viewBox="0 0 304 304" className="timer-ring" aria-hidden="true">
            <circle className="ring-track" cx="152" cy="152" r="138" />
            <circle
              className="ring-progress"
              cx="152"
              cy="152"
              r="138"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div className="timer-time" aria-live="off">
            <span className="time-label">Next splash in</span>
            <strong>{formatDuration(snapshot.remainingMs)}</strong>
            <span className="time-meta">{intervalMinutes} minute rhythm</span>
          </div>
          <span className="orbit-drop drop-one" aria-hidden="true" />
          <span className="orbit-drop drop-two" aria-hidden="true" />
        </div>

        <div className="primary-controls">
          <button
            className="primary-button"
            type="button"
            onClick={isRunning ? onPause : onStart}
            aria-label={isRunning ? 'Pause timer' : snapshot.status === 'paused' ? 'Resume timer' : 'Start timer'}
          >
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {isRunning ? 'Pause' : snapshot.status === 'paused' ? 'Resume' : 'Start splashing'}
          </button>
          <button className="small-control" type="button" onClick={onReset} aria-label="Reset timer"><RotateCcw size={18} /></button>
          <button className="small-control" type="button" onClick={onSkip} aria-label="Skip to a new cycle"><SkipForward size={18} /></button>
        </div>

        <div className="next-reminder">
          <span>Next reminder</span>
          <strong>{nextTime}</strong>
        </div>
      </section>
    </main>
  )
}
