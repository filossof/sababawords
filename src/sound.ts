// All sounds are synthesized with the Web Audio API – no audio files to load.
type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let out: AudioNode | null = null
let enabled = true

export function setSoundEnabled(on: boolean): void {
  enabled = on
}

function context(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  // everything goes through a limiter so loud sounds never clip
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -10
  limiter.ratio.value = 12
  limiter.connect(ctx.destination)
  out = limiter
  return ctx
}

/**
 * Browsers only allow audio after a user gesture, and phones (iOS especially) only count
 * "click"/"touchend" – not "pointerdown". So every gesture tries to unlock the context.
 */
function unlock(): void {
  const c = context()
  if (!c || c.state === 'running') return
  void c.resume().catch(() => {})
  // iOS: playing a silent buffer inside the gesture fully wakes the audio output
  const buf = c.createBuffer(1, 1, 22050)
  const src = c.createBufferSource()
  src.buffer = buf
  src.connect(c.destination)
  src.start(0)
}

/** Plays now if audio is running; otherwise waits briefly for the unlock, and drops stale sounds. */
function play(fn: (c: AudioContext, t: number) => void): void {
  if (!enabled) return
  const c = context()
  if (!c) return
  if (c.state === 'running') return fn(c, c.currentTime)
  const asked = performance.now()
  c.resume()
    .then(() => performance.now() - asked < 500 && enabled && fn(c, c.currentTime))
    .catch(() => {})
}

interface ToneOpts {
  type?: OscillatorType
  gain?: number
  /** slide to this frequency over the note */
  to?: number
}

function tone(c: AudioContext, freq: number, at: number, dur: number, { type = 'sine', gain = 0.3, to }: ToneOpts = {}) {
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + dur)
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(amp).connect(out!)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

/** A bell-like note: a sine plus a quieter octave above it. */
function chime(c: AudioContext, freq: number, at: number, dur = 0.4, gain = 0.32) {
  tone(c, freq, at, dur, { gain })
  tone(c, freq * 2, at, dur * 0.6, { gain: gain * 0.4 })
}

const [C5, E5, G5, A5, C6, E6, G6] = [523.25, 659.25, 783.99, 880, 1046.5, 1318.5, 1568]

export const sfx = {
  /** tap for any button */
  tap: () => play((c, t) => tone(c, 700, t, 0.09, { gain: 0.22, to: 480 })),
  /** on-screen keyboard key */
  key: () => play((c, t) => tone(c, 980, t, 0.06, { gain: 0.16 })),
  /** right answer: two rising chimes */
  correct: () =>
    play((c, t) => {
      chime(c, A5, t, 0.3)
      chime(c, E6, t + 0.12, 0.55)
    }),
  /** wrong answer: two falling notes */
  wrong: () =>
    play((c, t) => {
      tone(c, 260, t, 0.18, { type: 'triangle', gain: 0.35 })
      tone(c, 196, t + 0.15, 0.32, { type: 'triangle', gain: 0.35 })
    }),
  /** a correct pair while matching */
  match: () => play((c, t) => chime(c, G6, t, 0.4, 0.3)),
  /** lesson complete: rising arpeggio with a sparkle */
  complete: () =>
    play((c, t) => {
      ;[C5, E5, G5, C6].forEach((f, i) => chime(c, f, t + i * 0.12, 0.55))
      chime(c, E6, t + 0.55, 0.9, 0.3)
      chime(c, G6, t + 0.68, 1, 0.26)
    }),
  /** out of hearts */
  fail: () =>
    play((c, t) => {
      ;[392, 349.23, 311.13, 261.63].forEach((f, i) => tone(c, f, t + i * 0.18, 0.34, { type: 'triangle', gain: 0.32 }))
    }),
}

/** Anything a person would tap or click. Elements can opt out with data-silent (they make their own sound). */
const CLICKABLE = 'button, a[href], label, summary, select, [role="button"], input[type="checkbox"], input[type="radio"], input[type="date"]'

/** Every tap/click in the app makes a sound, and every gesture helps unlock audio on phones. */
export function installClickSounds(): () => void {
  const onDown = (e: Event) => {
    unlock()
    const el = (e.target as Element | null)?.closest?.<HTMLElement>(CLICKABLE)
    if (!el || (el as HTMLButtonElement).disabled || el.dataset.silent !== undefined) return
    if (el.classList.contains('kb-key')) sfx.key()
    else sfx.tap()
  }
  const onGesture = () => unlock()
  document.addEventListener('pointerdown', onDown, { capture: true })
  for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) document.addEventListener(ev, onGesture, { capture: true })
  return () => {
    document.removeEventListener('pointerdown', onDown, { capture: true })
    for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) document.removeEventListener(ev, onGesture, { capture: true })
  }
}
