import type { SettingsRepository, TimerRepository } from '../application/contracts'
import { DEFAULT_SETTINGS, normalizeSettings, type SplashSettings } from '../domain/settings'
import { createIdleTimer, type TimerSnapshot } from '../domain/timer'

const SETTINGS_KEY = 'splash:settings:v2'
const LEGACY_SETTINGS_KEY = 'splash:settings:v1'
const TIMER_KEY = 'splash:timer:v1'

interface StoredValue<T> {
  version: number
  data: T
}

function read<T>(key: string, version = 1): StoredValue<T> | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null') as StoredValue<T> | null
    return parsed?.version === version ? parsed : null
  } catch {
    return null
  }
}

function write<T>(key: string, data: T, version = 1) {
  try {
    localStorage.setItem(key, JSON.stringify({ version, data } satisfies StoredValue<T>))
  } catch {
    // The app remains usable when storage is unavailable or full.
  }
}

export const localSettingsRepository: SettingsRepository = {
  load() {
    const stored = read<Partial<SplashSettings>>(SETTINGS_KEY, 2)
      ?? read<Partial<SplashSettings>>(LEGACY_SETTINGS_KEY)
    return stored ? normalizeSettings(stored.data) : DEFAULT_SETTINGS
  },
  save(settings) {
    write(SETTINGS_KEY, normalizeSettings(settings), 2)
  },
}

export const localTimerRepository: TimerRepository = {
  load(durationMs) {
    const stored = read<TimerSnapshot>(TIMER_KEY)?.data
    if (!stored || !['idle', 'running', 'paused', 'ringing'].includes(stored.status)) {
      return createIdleTimer(durationMs)
    }
    return {
      ...stored,
      completedCount: Math.max(0, Number(stored.completedCount) || 0),
      remainingMs: Math.max(0, Number(stored.remainingMs) || durationMs),
      deadline: stored.deadline ? Number(stored.deadline) : null,
    }
  },
  save(snapshot) {
    write(TIMER_KEY, snapshot)
  },
}
