import { Pause, Play, RotateCcw, SkipForward, Sparkles } from 'lucide-react'
import type { Routine, RoutineId } from '../domain/settings'
import { formatDuration, type TimerSnapshot } from '../domain/timer'

interface TimerHeroProps {
  snapshot: TimerSnapshot
  durationMs: number
  routines: Routine[]
  activeRoutine: Routine
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onChooseInterval: (minutes: number) => void
  onChooseRoutine: (routineId: RoutineId) => void
}

const PRESETS = [10, 15, 20, 30]

export function TimerHero({
  snapshot,
  durationMs,
  routines,
  activeRoutine,
  onStart,
  onPause,
  onReset,
  onSkip,
  onChooseInterval,
  onChooseRoutine,
}: TimerHeroProps) {
  const progress = Math.min(1, Math.max(0, snapshot.remainingMs / durationMs))
  const circumference = 2 * Math.PI * 138
  const nextTime = snapshot.deadline
    ? new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(snapshot.deadline)
    : 'Not scheduled'
  const isRunning = snapshot.status === 'running'
  const statusLabel = snapshot.status === 'idle' ? `${activeRoutine.name} is ready` : snapshot.status === 'paused' ? 'Paused' : isRunning ? 'Flow in progress' : `${activeRoutine.name} time`

  return (
    <main className="hero" id="top">
      <section className="hero-copy" aria-labelledby="page-title">
        <span className="eyebrow"><Sparkles size={14} /> A tiny ritual for brighter focus</span>
        <h1 id="page-title">Pause. Reset.<br /><em>Come back fresh.</em></h1>
        <p className="hero-lede">Choose a small ritual, set your rhythm, and let Splash gently bring you back to yourself.</p>

        <div className="routine-picker" aria-label="Choose an active routine">
          <span>Choose your reset</span>
          <div className="routine-row">
            {routines.map((routine) => (
              <button
                key={routine.id}
                type="button"
                className={activeRoutine.id === routine.id ? 'routine-pill active' : 'routine-pill'}
                onClick={() => onChooseRoutine(routine.id)}
                aria-pressed={activeRoutine.id === routine.id}
              >
                <span aria-hidden="true">{routine.symbol}</span>
                {routine.name}
              </button>
            ))}
          </div>
        </div>

        <div className="interval-picker" aria-label="Quick interval selection">
          <span>Remind me every</span>
          <div className="preset-row">
            {PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={activeRoutine.intervalMinutes === minutes ? 'preset active' : 'preset'}
                onClick={() => onChooseInterval(minutes)}
                aria-pressed={activeRoutine.intervalMinutes === minutes}
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

      <section className="timer-card" aria-label={`${activeRoutine.name} timer`}>
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
            <span className="time-label">Next {activeRoutine.name.toLowerCase()} in</span>
            <strong>{formatDuration(snapshot.remainingMs)}</strong>
            <span className="time-meta">{activeRoutine.intervalMinutes} minute rhythm</span>
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
            {isRunning ? 'Pause' : snapshot.status === 'paused' ? 'Resume' : `Start ${activeRoutine.name.toLowerCase()}`}
          </button>
          <button className="small-control" type="button" onClick={onReset} aria-label="Reset timer"><RotateCcw size={18} /></button>
          <button className="small-control" type="button" onClick={onSkip} aria-label="Skip to a new cycle"><SkipForward size={18} /></button>
        </div>

        <div className="next-reminder">
          <span>Next {activeRoutine.name.toLowerCase()}</span>
          <strong>{nextTime}</strong>
        </div>
      </section>
    </main>
  )
}
