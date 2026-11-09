import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '../domain/settings'
import { createIdleTimer } from '../domain/timer'
import { localSettingsRepository, localTimerRepository } from './localRepository'

describe('local repositories', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when no preference exists', () => {
    expect(localSettingsRepository.load()).toEqual(DEFAULT_SETTINGS)
  })

  it('normalizes saved preference values', () => {
    localSettingsRepository.save({ ...DEFAULT_SETTINGS, intervalMinutes: 999, volume: -1 })
    expect(localSettingsRepository.load()).toMatchObject({ intervalMinutes: 180, volume: 0 })
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
