import { useCallback, useEffect, useRef, useState } from 'react'
import type { TimerRepository } from './contracts'
import {
  pauseTimer,
  reconcileTimer,
  resetTimer,
  scheduleNext,
  snoozeTimer,
  startTimer,
  type TimerSnapshot,
} from '../domain/timer'

interface UseSplashTimerOptions {
  durationMs: number
  repository: TimerRepository
  onRing: () => void
}

export function useSplashTimer({ durationMs, repository, onRing }: UseSplashTimerOptions) {
  const onRingRef = useRef(onRing)
  useEffect(() => {
    onRingRef.current = onRing
  }, [onRing])
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() => {
    const stored = repository.load(durationMs)
    return reconcileTimer(stored, Date.now(), durationMs)
  })
  const announcedCycleRef = useRef<string | null>(null)

  const commit = useCallback((next: TimerSnapshot) => {
    repository.save(next)
    return next
  }, [repository])

  useEffect(() => {
    const tick = () => {
      setSnapshot((current) => {
        const next = reconcileTimer(current, Date.now(), durationMs)
        if (current.status !== 'ringing' && next.status === 'ringing') repository.save(next)
        return next
      })
    }

    tick()
    const intervalId = window.setInterval(tick, 500)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [durationMs, repository])

  useEffect(() => {
    if (snapshot.status === 'ringing' && announcedCycleRef.current !== snapshot.cycleId) {
      announcedCycleRef.current = snapshot.cycleId
      onRingRef.current()
    }
  }, [snapshot.cycleId, snapshot.status])

  const start = useCallback(() => {
    setSnapshot((current) => commit(startTimer(current, Date.now(), durationMs)))
  }, [commit, durationMs])

  const pause = useCallback(() => {
    setSnapshot((current) => commit(pauseTimer(current, Date.now())))
  }, [commit])

  const reset = useCallback((nextDurationMs = durationMs) => {
    setSnapshot((current) => commit(resetTimer(current, nextDurationMs)))
  }, [commit, durationMs])

  const skip = useCallback(() => {
    setSnapshot((current) => commit(scheduleNext(current, Date.now(), durationMs, false)))
  }, [commit, durationMs])

  const complete = useCallback(() => {
    setSnapshot((current) => commit(scheduleNext(current, Date.now(), durationMs, true)))
  }, [commit, durationMs])

  const snooze = useCallback((minutes = 5) => {
    setSnapshot((current) => commit(snoozeTimer(current, Date.now(), minutes)))
  }, [commit])

  return { snapshot, start, pause, reset, skip, complete, snooze }
}
