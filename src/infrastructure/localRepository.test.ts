import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, getActiveRoutine } from '../domain/settings'
import { createIdleTimer } from '../domain/timer'
import { localSettingsRepository, localTimerRepository } from './localRepository'

describe('local repositories', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when no preference exists', () => {
    expect(localSettingsRepository.load()).toEqual(DEFAULT_SETTINGS)
  })

  it('normalizes saved preference values', () => {
    const routines = DEFAULT_SETTINGS.routines.map((routine) => routine.id === 'face-splash'
      ? { ...routine, intervalMinutes: 999, volume: -1 }
      : routine)
    localSettingsRepository.save({ ...DEFAULT_SETTINGS, routines })
    expect(getActiveRoutine(localSettingsRepository.load())).toMatchObject({ intervalMinutes: 180, volume: 0 })
  })

  it('migrates legacy single-routine preferences into face splash', () => {
    localStorage.setItem('splash:settings:v1', JSON.stringify({
      version: 1,
      data: { intervalMinutes: 25, reminderTitle: 'Legacy reminder', sound: 'bright', volume: 0.7 },
    }))
    const settings = localSettingsRepository.load()

    expect(getActiveRoutine(settings)).toMatchObject({ intervalMinutes: 25, reminderTitle: 'Legacy reminder', sound: 'bright', volume: 0.7 })
    expect(settings.routines).toHaveLength(5)
    expect(settings.routines.some((routine) => routine.id === 'scalp-splash')).toBe(true)
  })

  it('round trips timer state', () => {
    const timer = { ...createIdleTimer(60_000), completedCount: 3 }
    localTimerRepository.save(timer)
    expect(localTimerRepository.load(60_000)).toMatchObject({ status: 'idle', completedCount: 3, remainingMs: 60_000 })
  })

  it('recovers from invalid stored data', () => {
    localStorage.setItem('splash:settings:v1', '{not-json')
    expect(localSettingsRepository.load()).toEqual(DEFAULT_SETTINGS)
  })
})
