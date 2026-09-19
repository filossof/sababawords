// All sounds are synthesized with the Web Audio API – no audio files to load.
type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean): void {
  enabled = on
}

function audio(): AudioContext | null {
  if (!enabled) return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface ToneOpts {
  type?: OscillatorType
  gain?: number
  /** slide to this frequency over the note */
  to?: number
}

function tone(c: AudioContext, freq: number, at: number, dur: number, { type = 'sine', gain = 0.12, to }: ToneOpts = {}) {
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + dur)
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(amp).connect(c.destination)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

/** A bell-like note: a sine plus a quieter octave above it. */
function chime(c: AudioContext, freq: number, at: number, dur = 0.35, gain = 0.12) {
  tone(c, freq, at, dur, { gain })
  tone(c, freq * 2, at, dur * 0.6, { gain: gain * 0.35 })
}

function play(fn: (c: AudioContext, t: number) => void) {
  const c = audio()
  if (c) fn(c, c.currentTime)
}

const [C5, E5, G5, A5, C6, E6, G6] = [523.25, 659.25, 783.99, 880, 1046.5, 1318.5, 1568]

export const sfx = {
  /** soft tap for any button */
  tap: () => play((c, t) => tone(c, 620, t, 0.06, { gain: 0.05, to: 480 })),
  /** on-screen keyboard key */
  key: () => play((c, t) => tone(c, 900, t, 0.04, { gain: 0.035 })),
  /** right answer: two rising chimes */
  correct: () =>
    play((c, t) => {
      chime(c, A5, t, 0.25)
      chime(c, E6, t + 0.11, 0.45)
    }),
  /** wrong answer: two soft falling notes */
  wrong: () =>
    play((c, t) => {
      tone(c, 260, t, 0.16, { type: 'triangle', gain: 0.13 })
      tone(c, 196, t + 0.13, 0.28, { type: 'triangle', gain: 0.13 })
    }),
  /** a correct pair while matching */
  match: () => play((c, t) => chime(c, G6, t, 0.3, 0.1)),
  /** lesson complete: rising arpeggio with a sparkle */
  complete: () =>
    play((c, t) => {
      ;[C5, E5, G5, C6].forEach((f, i) => chime(c, f, t + i * 0.11, 0.5))
      chime(c, E6, t + 0.5, 0.9, 0.1)
      chime(c, G6, t + 0.62, 1, 0.08)
    }),
  /** out of hearts */
  fail: () =>
    play((c, t) => {
      ;[392, 349.23, 311.13, 261.63].forEach((f, i) => tone(c, f, t + i * 0.17, 0.3, { type: 'triangle', gain: 0.12 }))
    }),
}

/** Plays a tap/key sound for every enabled button press in the app. Buttons can opt out with data-silent. */
export function installClickSounds(): void {
  document.addEventListener(
    'pointerdown',
    (e) => {
      const btn = (e.target as Element | null)?.closest?.('button')
      if (!btn || btn.disabled || btn.dataset.silent !== undefined) return
      if (btn.classList.contains('kb-key')) sfx.key()
      else sfx.tap()
    },
    { capture: true },
  )
}
