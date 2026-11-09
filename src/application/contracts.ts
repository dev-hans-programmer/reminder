import type { SplashSettings } from '../domain/settings'
import type { TimerSnapshot } from '../domain/timer'

export interface SettingsRepository {
  load(): SplashSettings
  save(settings: SplashSettings): void
}

export interface TimerRepository {
  load(durationMs: number): TimerSnapshot
  save(snapshot: TimerSnapshot): void
}
