import { describe, expect, it } from 'vitest'
import { createIdleTimer, formatDuration, pauseTimer, reconcileTimer, scheduleNext, startTimer } from './timer'

const MINUTE = 60_000

describe('timer domain', () => {
  it('starts from an absolute deadline and reconciles remaining time', () => {
    const idle = createIdleTimer(15 * MINUTE)
    const running = startTimer(idle, 1_000, 15 * MINUTE)

    expect(running.deadline).toBe(901_000)
    expect(reconcileTimer(running, 61_000, 15 * MINUTE).remainingMs).toBe(14 * MINUTE)
  })

  it('rings when the deadline has elapsed', () => {
    const running = startTimer(createIdleTimer(MINUTE), 5_000, MINUTE)
    const elapsed = reconcileTimer(running, 65_001, MINUTE)

    expect(elapsed.status).toBe('ringing')
    expect(elapsed.remainingMs).toBe(0)
    expect(elapsed.deadline).toBeNull()
  })

  it('pauses with calculated time instead of a stale display value', () => {
    const running = startTimer(createIdleTimer(MINUTE), 10_000, MINUTE)
    const paused = pauseTimer(running, 25_000)

    expect(paused.status).toBe('paused')
    expect(paused.remainingMs).toBe(45_000)
  })

  it('tracks only completed cycles', () => {
    const timer = createIdleTimer(MINUTE)
    expect(scheduleNext(timer, 0, MINUTE, false).completedCount).toBe(0)
    expect(scheduleNext(timer, 0, MINUTE, true).completedCount).toBe(1)
  })

  it('formats a stable countdown', () => {
    expect(formatDuration(900_000)).toBe('15:00')
    expect(formatDuration(1)).toBe('00:01')
    expect(formatDuration(0)).toBe('00:00')
  })
})
