export const SOUND_OPTIONS = ['gentle', 'ripple', 'bright', 'off'] as const
export type SoundId = (typeof SOUND_OPTIONS)[number]

export const ROUTINE_IDS = ['face-splash', 'scalp-splash', 'hydrate', 'stretch', 'eye-break'] as const
export type RoutineId = (typeof ROUTINE_IDS)[number]

export interface Routine {
  id: RoutineId
  name: string
  symbol: string
  intervalMinutes: number
  reminderTitle: string
  reminderMessage: string
  sound: SoundId
  volume: number
}

export interface SplashSettings {
  activeRoutineId: RoutineId
  routines: Routine[]
  reduceMotion: boolean
}

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'face-splash',
    name: 'Face splash',
    symbol: '💦',
    intervalMinutes: 15,
    reminderTitle: 'Time for a face splash!',
    reminderMessage: 'Cool water, three deep breaths, then come back refreshed.',
    sound: 'gentle',
    volume: 0.55,
  },
  {
    id: 'scalp-splash',
    name: 'Scalp splash',
    symbol: '🫧',
    intervalMinutes: 30,
    reminderTitle: 'Refresh your scalp',
    reminderMessage: 'Take a moment for a cool scalp splash and return feeling lighter.',
    sound: 'ripple',
    volume: 0.5,
  },
  {
    id: 'hydrate',
    name: 'Hydrate',
    symbol: '💧',
    intervalMinutes: 30,
    reminderTitle: 'A little water break',
    reminderMessage: 'Take a few slow sips of water. Your future self will thank you.',
    sound: 'gentle',
    volume: 0.5,
  },
  {
    id: 'stretch',
    name: 'Stretch',
    symbol: '🙆',
    intervalMinutes: 45,
    reminderTitle: 'Time to loosen up',
    reminderMessage: 'Roll your shoulders, reach tall, and give your body a gentle reset.',
    sound: 'bright',
    volume: 0.45,
  },
  {
    id: 'eye-break',
    name: 'Eye break',
    symbol: '👀',
    intervalMinutes: 20,
    reminderTitle: 'Give your eyes a break',
    reminderMessage: 'Look at something far away, blink slowly, and soften your focus.',
    sound: 'gentle',
    volume: 0.45,
  },
]

export const DEFAULT_SETTINGS: SplashSettings = {
  activeRoutineId: 'face-splash',
  routines: DEFAULT_ROUTINES,
  reduceMotion: false,
}

interface LegacySettings {
  intervalMinutes?: number
  reminderTitle?: string
  reminderMessage?: string
  sound?: SoundId
  volume?: number
  reduceMotion?: boolean
}

export function getActiveRoutine(settings: SplashSettings) {
  return settings.routines.find((routine) => routine.id === settings.activeRoutineId) ?? settings.routines[0] ?? DEFAULT_ROUTINES[0]
}

export function updateRoutine(settings: SplashSettings, routineId: RoutineId, changes: Partial<Omit<Routine, 'id' | 'symbol'>>): SplashSettings {
  return {
    ...settings,
    routines: settings.routines.map((routine) => routine.id === routineId ? { ...routine, ...changes } : routine),
  }
}

export function normalizeSettings(value: Partial<SplashSettings> & LegacySettings): SplashSettings {
  const storedRoutines = Array.isArray(value.routines) ? value.routines : []
  const isLegacy = storedRoutines.length === 0 && value.intervalMinutes !== undefined
  const routines = DEFAULT_ROUTINES.map((fallback) => {
    const stored = storedRoutines.find((routine) => routine?.id === fallback.id)
    const source = isLegacy && fallback.id === 'face-splash' ? { ...fallback, ...value } : stored
    return normalizeRoutine(source, fallback)
  })
  const activeRoutineId = value.activeRoutineId && ROUTINE_IDS.includes(value.activeRoutineId)
    ? value.activeRoutineId
    : DEFAULT_SETTINGS.activeRoutineId

  return {
    activeRoutineId,
    routines,
    reduceMotion: Boolean(value.reduceMotion),
  }
}

function normalizeRoutine(value: Partial<Routine> | undefined, fallback: Routine): Routine {
  const interval = Number(value?.intervalMinutes)
  const volume = Number(value?.volume)
  return {
    id: fallback.id,
    symbol: fallback.symbol,
    name: cleanText(value?.name, fallback.name, 30),
    intervalMinutes: Number.isFinite(interval) ? Math.min(180, Math.max(1, Math.round(interval))) : fallback.intervalMinutes,
    reminderTitle: cleanText(value?.reminderTitle, fallback.reminderTitle, 60),
    reminderMessage: cleanText(value?.reminderMessage, fallback.reminderMessage, 160),
    sound: value?.sound && SOUND_OPTIONS.includes(value.sound) ? value.sound : fallback.sound,
    volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : fallback.volume,
  }
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback
}
