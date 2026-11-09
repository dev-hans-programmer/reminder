export type TimerStatus = 'idle' | 'running' | 'paused' | 'ringing'

export interface TimerSnapshot {
  status: TimerStatus
  deadline: number | null
  remainingMs: number
  completedCount: number
  cycleId: string
}

export const createIdleTimer = (durationMs: number): TimerSnapshot => ({
  status: 'idle',
  deadline: null,
  remainingMs: durationMs,
  completedCount: 0,
  cycleId: createCycleId(),
})

export function reconcileTimer(snapshot: TimerSnapshot, now: number, durationMs: number): TimerSnapshot {
  if (snapshot.status !== 'running' || snapshot.deadline === null) return snapshot

  const remainingMs = Math.max(0, snapshot.deadline - now)
  if (remainingMs === 0) {
    return { ...snapshot, status: 'ringing', remainingMs: 0, deadline: null }
  }

  return { ...snapshot, remainingMs: Math.min(remainingMs, durationMs) }
}

export function startTimer(snapshot: TimerSnapshot, now: number, durationMs: number): TimerSnapshot {
  const remaining = snapshot.status === 'paused' ? snapshot.remainingMs : durationMs
  return {
    ...snapshot,
    status: 'running',
    remainingMs: remaining,
    deadline: now + remaining,
    cycleId: createCycleId(),
  }
}

export function pauseTimer(snapshot: TimerSnapshot, now: number): TimerSnapshot {
  if (snapshot.status !== 'running' || snapshot.deadline === null) return snapshot
  return {
    ...snapshot,
    status: 'paused',
    remainingMs: Math.max(0, snapshot.deadline - now),
    deadline: null,
  }
}

export function resetTimer(snapshot: TimerSnapshot, durationMs: number): TimerSnapshot {
  return {
    ...snapshot,
    status: 'idle',
    deadline: null,
    remainingMs: durationMs,
    cycleId: createCycleId(),
  }
}

export function scheduleNext(snapshot: TimerSnapshot, now: number, durationMs: number, completed: boolean): TimerSnapshot {
  return {
    status: 'running',
    deadline: now + durationMs,
    remainingMs: durationMs,
    completedCount: snapshot.completedCount + (completed ? 1 : 0),
    cycleId: createCycleId(),
  }
}

export function snoozeTimer(snapshot: TimerSnapshot, now: number, minutes: number): TimerSnapshot {
  const durationMs = minutes * 60_000
  return {
    ...snapshot,
    status: 'running',
    deadline: now + durationMs,
    remainingMs: durationMs,
    cycleId: createCycleId(),
  }
}

export function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function createCycleId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
