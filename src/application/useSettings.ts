import { useCallback, useState } from 'react'
import type { SettingsRepository } from './contracts'
import { normalizeSettings, type SplashSettings } from '../domain/settings'

export function useSettings(repository: SettingsRepository) {
  const [settings, setSettings] = useState(() => repository.load())

  const updateSettings = useCallback((next: SplashSettings) => {
    const normalized = normalizeSettings(next)
    repository.save(normalized)
    setSettings(normalized)
  }, [repository])

  return { settings, updateSettings }
}
