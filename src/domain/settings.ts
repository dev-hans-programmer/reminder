export const SOUND_OPTIONS = ['gentle', 'ripple', 'bright', 'off'] as const
export type SoundId = (typeof SOUND_OPTIONS)[number]

export interface SplashSettings {
  intervalMinutes: number
  reminderTitle: string
  reminderMessage: string
  sound: SoundId
  volume: number
  reduceMotion: boolean
}

export const DEFAULT_SETTINGS: SplashSettings = {
  intervalMinutes: 15,
  reminderTitle: 'Time for a splash!',
  reminderMessage: 'Cool water, three deep breaths, then come back refreshed.',
  sound: 'gentle',
  volume: 0.55,
  reduceMotion: false,
}

export function normalizeSettings(value: Partial<SplashSettings>): SplashSettings {
  const interval = Number(value.intervalMinutes)
  const volume = Number(value.volume)

  return {
    intervalMinutes: Number.isFinite(interval) ? Math.min(180, Math.max(1, Math.round(interval))) : DEFAULT_SETTINGS.intervalMinutes,
    reminderTitle: cleanText(value.reminderTitle, DEFAULT_SETTINGS.reminderTitle, 60),
    reminderMessage: cleanText(value.reminderMessage, DEFAULT_SETTINGS.reminderMessage, 160),
    sound: value.sound && SOUND_OPTIONS.includes(value.sound) ? value.sound : DEFAULT_SETTINGS.sound,
    volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_SETTINGS.volume,
    reduceMotion: Boolean(value.reduceMotion),
  }
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback
}
