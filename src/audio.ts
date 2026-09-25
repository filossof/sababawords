import { useEffect, useState } from 'react'
import type { Lang } from './types'

const locale: Record<Lang, string> = { en: 'en-US', ar: 'ar-SA', bg: 'bg-BG' }

/** Voices that are jokes or sound effects (macOS "novelty" voices) – they mispronounce ordinary words. */
const NOVELTY =
  /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Junior|Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Kathy|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley)\b/i

/** Natural-sounding voices, best first. */
const PREFERRED =
  /Daria|Samantha|Google US English|Aria|Jenny|Ava|Allison|Alex|Susan|Zira|Google UK English|Daniel|Karen|Moira|Tessa|Natural|Neural|Premium|Enhanced/i

let preferred: Partial<Record<Lang, string>> = {}

/** The app tells us which voice the user picked (by name); empty = automatic. */
export function setVoicePreferences(p: Partial<Record<Lang, string>>): void {
  preferred = p
}

/* ------------------------------------------------------------------ *
 * What a device *lists* and what it can *say* are different things:
 * phones (Android especially) often speak a language that never shows
 * up in getVoices(). So audio stays on until speaking actually fails.
 * ------------------------------------------------------------------ */
const FAILED_KEY = 'sababawords:tts-failed:v1'
let failed: Partial<Record<Lang, boolean>> = (() => {
  try {
    return JSON.parse(localStorage.getItem(FAILED_KEY) ?? '{}')
  } catch {
    return {}
  }
})()

function rememberSpeech(lang: Lang, worked: boolean) {
  if (!!failed[lang] === !worked) return
  failed = { ...failed, [lang]: !worked }
  try {
    localStorage.setItem(FAILED_KEY, JSON.stringify(failed))
  } catch {
    /* best effort */
  }
  notify()
}

/** Forgets what we learned about speech failures (used when the user asks to test again). */
export function forgetSpeechFailures(): void {
  failed = {}
  try {
    localStorage.removeItem(FAILED_KEY)
  } catch {
    /* best effort */
  }
  notify()
}

/** 'auto' follows what the device reports; the others force listening exercises on or off. */
export type Listening = 'auto' | 'on' | 'off'
let listening: Listening = 'auto'
export function setListening(mode: Listening): void {
  listening = mode
  notify()
}

/* ------------------------------------------------------------------ *
 * The voice list loads asynchronously, and on Android it often starts
 * out empty and fills only after a delay or the first tap – so we keep
 * re-reading it instead of trusting the first answer.
 * ------------------------------------------------------------------ */
const listeners = new Set<() => void>()
let voices: SpeechSynthesisVoice[] = []
let started = false

function notify() {
  for (const fn of listeners) fn()
}

function refresh() {
  if (typeof speechSynthesis === 'undefined') return
  const next = speechSynthesis.getVoices()
  if (next.length === voices.length && next.every((v, i) => v.name === voices[i]?.name)) return
  voices = next
  notify()
}

function start() {
  if (started || typeof speechSynthesis === 'undefined') return
  started = true
  refresh()
  speechSynthesis.addEventListener('voiceschanged', refresh)
  // Android/Chrome fill the list late; a few retries cost nothing and avoid a wrong "no voice" verdict
  for (const ms of [100, 300, 800, 1500, 3000, 6000]) setTimeout(refresh, ms)
  document.addEventListener('pointerdown', refresh, { once: true, capture: true })
  document.addEventListener('visibilitychange', refresh)
}

function voicesFor(lang: Lang): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang))
}

function score(v: SpeechSynthesisVoice, lang: Lang): number {
  let s = 0
  if (NOVELTY.test(v.name)) s -= 100
  if (PREFERRED.test(v.name)) s += 50
  if (v.lang.toLowerCase().replace('_', '-') === locale[lang].toLowerCase()) s += 20
  if (lang === 'en' && /^en-(us|gb)$/i.test(v.lang.replace('_', '-'))) s += 5
  return s
}

/** Voices worth offering in the picker, best first (novelty voices are hidden). */
export function listVoices(lang: Lang): SpeechSynthesisVoice[] {
  return voicesFor(lang)
    .filter((v) => !NOVELTY.test(v.name))
    .sort((a, b) => score(b, lang) - score(a, lang) || a.name.localeCompare(b.name))
}

export function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const all = voicesFor(lang)
  const chosen = preferred[lang] && all.find((v) => v.name === preferred[lang])
  if (chosen) return chosen
  return [...all].sort((a, b) => score(b, lang) - score(a, lang))[0]
}

/**
 * 'ready'   – the device reports a voice for this language
 * 'unknown' – it reports no voices at all (common on Android); we assume speaking works and try
 * 'missing' – it lists voices, but none for this language
 */
export type VoiceState = 'ready' | 'unknown' | 'missing'

export function voiceState(lang: Lang): VoiceState {
  if (typeof speechSynthesis === 'undefined') return 'missing'
  if (voicesFor(lang).length > 0) return 'ready'
  return voices.length === 0 ? 'unknown' : 'missing'
}

function subscribe(onChange: () => void): () => void {
  start()
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

/** Re-reads `read()` whenever the device's voice list (or the listening setting) changes. */
function useVoiceSnapshot<T>(read: () => T, deps: unknown[], equal: (a: T, b: T) => boolean = Object.is): T {
  const [value, setValue] = useState(read)
  useEffect(() => {
    const update = () => setValue((prev) => { const next = read(); return equal(prev, next) ? prev : next })
    update()
    return subscribe(update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return value
}

export function useVoiceStatus(lang: Lang): VoiceState {
  return useVoiceSnapshot(() => voiceState(lang), [lang])
}

/**
 * Whether to offer listening exercises and speaker buttons for this language.
 * Optimistic on purpose: only a speech attempt that actually failed turns audio off.
 */
export function useVoice(lang: Lang): boolean {
  return useVoiceSnapshot(() => audioAvailable(lang), [lang])
}

export function audioAvailable(lang: Lang): boolean {
  if (typeof speechSynthesis === 'undefined') return false
  if (listening === 'on') return true
  if (listening === 'off') return false
  return !failed[lang]
}

/** Re-renders when the device finishes loading its voice list. */
export function useVoiceList(lang: Lang): SpeechSynthesisVoice[] {
  return useVoiceSnapshot(
    () => listVoices(lang),
    [lang],
    (a, b) => a.length === b.length && a.every((v, i) => v.name === b[i].name),
  )
}

/**
 * Speaks the text. Resolves with what happened, so the settings screen can tell the user
 * whether their device really spoke instead of guessing from the voice list.
 */
export function speak(text: string, lang: Lang): Promise<'spoken' | 'failed' | 'unsupported'> {
  if (typeof speechSynthesis === 'undefined') return Promise.resolve('unsupported')
  start()
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = pickVoice(lang)
  // With no matching voice we still ask for the language: the device may have an engine for it
  // that simply is not listed (Android), and we would rather try than stay silent.
  u.lang = voice?.lang ?? locale[lang]
  if (voice) u.voice = voice
  u.rate = 0.85
  return new Promise((resolve) => {
    let settled = false
    const done = (result: 'spoken' | 'failed') => {
      if (settled) return
      settled = true
      rememberSpeech(lang, result === 'spoken')
      resolve(result)
    }
    u.addEventListener('start', () => done('spoken'))
    u.addEventListener('end', () => done('spoken'))
    u.addEventListener('error', () => done('failed'))
    speechSynthesis.speak(u)
    setTimeout(() => done(speechSynthesis.speaking || speechSynthesis.pending ? 'spoken' : 'failed'), 2500)
  })
}
