import type { AlertSeverity } from '@/store/alertStore'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  return ctx
}

/** Kort beep — frekvens og varighet avhenger av severity */
export function playAlertBeep(severity: AlertSeverity) {
  const ac = getCtx()
  if (!ac) return

  // Resume suspended context (kreves etter user-gesture policy)
  if (ac.state === 'suspended') {
    void ac.resume()
    return
  }

  const config: Record<AlertSeverity, { freq: number; dur: number; gain: number }> = {
    CRITICAL: { freq: 880, dur: 0.18, gain: 0.25 },
    WARNING:  { freq: 660, dur: 0.12, gain: 0.15 },
    INFO:     { freq: 440, dur: 0.08, gain: 0.08 },
  }
  const { freq, dur, gain } = config[severity]

  const osc  = ac.createOscillator()
  const amp  = ac.createGain()

  osc.connect(amp)
  amp.connect(ac.destination)

  osc.type      = 'square'
  osc.frequency.setValueAtTime(freq, ac.currentTime)

  amp.gain.setValueAtTime(gain, ac.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur)

  osc.start(ac.currentTime)
  osc.stop(ac.currentTime + dur)
}
