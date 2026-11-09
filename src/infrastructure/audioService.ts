import type { SoundId } from '../domain/settings'

let audioContext: AudioContext | null = null
let reminderLoopId: number | null = null
const reminderTones = new Set<{ oscillator: OscillatorNode; gain: GainNode }>()

function getContext() {
  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

function tone(
  context: AudioContext,
  at: number,
  frequency: number,
  duration: number,
  gainValue: number,
  type: OscillatorType = 'sine',
  activeTones?: Set<{ oscillator: OscillatorNode; gain: GainNode }>,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const scheduledTone = { oscillator, gain }
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, at)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.92), at + duration)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), at + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain).connect(context.destination)
  activeTones?.add(scheduledTone)
  oscillator.addEventListener('ended', () => {
    activeTones?.delete(scheduledTone)
    oscillator.disconnect()
    gain.disconnect()
  }, { once: true })
  oscillator.start(at)
  oscillator.stop(at + duration + 0.05)
}

async function playPattern(sound: SoundId, volume: number, activeTones?: Set<{ oscillator: OscillatorNode; gain: GainNode }>) {
  if (sound === 'off' || volume <= 0 || !('AudioContext' in window)) return

  try {
    const context = getContext()
    await context.resume()
    const now = context.currentTime + 0.02
    const level = Math.min(0.28, Math.max(0.01, volume * 0.22))

    if (sound === 'gentle') {
      tone(context, now, 523.25, 0.5, level, 'sine', activeTones)
      tone(context, now + 0.25, 659.25, 0.65, level * 0.85, 'sine', activeTones)
    } else if (sound === 'ripple') {
      tone(context, now, 392, 0.75, level * 0.75, 'sine', activeTones)
      tone(context, now + 0.16, 523.25, 0.8, level * 0.6, 'sine', activeTones)
      tone(context, now + 0.34, 783.99, 0.85, level * 0.42, 'sine', activeTones)
    } else {
      tone(context, now, 880, 0.3, level, 'triangle', activeTones)
      tone(context, now + 0.22, 1174.66, 0.45, level * 0.9, 'triangle', activeTones)
      tone(context, now + 0.44, 1318.51, 0.6, level * 0.75, 'triangle', activeTones)
    }
  } catch {
    // Audio is an enhancement; timer behavior must never depend on it.
  }
}

export function playSound(sound: SoundId, volume: number) {
  return playPattern(sound, volume)
}

export function startReminderSound(sound: SoundId, volume: number) {
  stopReminderSound()
  if (sound === 'off' || volume <= 0) return

  void playPattern(sound, volume, reminderTones)
  reminderLoopId = window.setInterval(() => {
    void playPattern(sound, volume, reminderTones)
  }, 4_000)
}

export function stopReminderSound() {
  if (reminderLoopId !== null) {
    window.clearInterval(reminderLoopId)
    reminderLoopId = null
  }

  const now = audioContext?.currentTime ?? 0
  reminderTones.forEach(({ oscillator, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)
      oscillator.stop(now + 0.05)
    } catch {
      // A tone that already ended needs no additional cleanup.
    }
  })
  reminderTones.clear()
}

export function unlockAudio() {
  if ('AudioContext' in window) getContext()
}
