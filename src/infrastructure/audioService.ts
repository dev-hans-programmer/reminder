import type { SoundId } from '../domain/settings'

let audioContext: AudioContext | null = null

function getContext() {
  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

function tone(context: AudioContext, at: number, frequency: number, duration: number, gainValue: number, type: OscillatorType = 'sine') {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, at)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.92), at + duration)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), at + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.05)
}

export async function playSound(sound: SoundId, volume: number) {
  if (sound === 'off' || volume <= 0 || !('AudioContext' in window)) return

  try {
    const context = getContext()
    await context.resume()
    const now = context.currentTime + 0.02
    const level = Math.min(0.28, Math.max(0.01, volume * 0.22))

    if (sound === 'gentle') {
      tone(context, now, 523.25, 0.5, level)
      tone(context, now + 0.25, 659.25, 0.65, level * 0.85)
    } else if (sound === 'ripple') {
      tone(context, now, 392, 0.75, level * 0.75, 'sine')
      tone(context, now + 0.16, 523.25, 0.8, level * 0.6, 'sine')
      tone(context, now + 0.34, 783.99, 0.85, level * 0.42, 'sine')
    } else {
      tone(context, now, 880, 0.3, level, 'triangle')
      tone(context, now + 0.22, 1174.66, 0.45, level * 0.9, 'triangle')
      tone(context, now + 0.44, 1318.51, 0.6, level * 0.75, 'triangle')
    }
  } catch {
    // Audio is an enhancement; timer behavior must never depend on it.
  }
}

export function unlockAudio() {
  if ('AudioContext' in window) getContext()
}
