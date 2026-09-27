/**
 * Speaking exercises: the browser listens through the microphone and tells us what it heard.
 *
 * Support is uneven (Chrome and Safari yes, Firefox no) and recognition needs the network and
 * microphone permission, so – like the text-to-speech side – we stay optimistic and only turn
 * speaking exercises off once an attempt has really failed.
 */
import { useEffect, useState } from 'react'
import type { Lang } from './types'

const locale: Record<Lang, string> = { en: 'en-US', ar: 'ar-SA', bg: 'bg-BG' }

interface RecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
}
type RecognitionCtor = new () => RecognitionLike
type SpeechWindow = typeof window & {
  SpeechRecognition?: RecognitionCtor
  webkitSpeechRecognition?: RecognitionCtor
}

export type SpeakingMode = 'auto' | 'on' | 'off'
let mode: SpeakingMode = 'auto'

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((fn) => fn())

export function setSpeakingMode(next: SpeakingMode): void {
  mode = next
  notify()
}

const FAILED_KEY = 'sababawords:asr-failed:v1'
let failed: Partial<Record<Lang, string>> = (() => {
  try {
    return JSON.parse(localStorage.getItem(FAILED_KEY) ?? '{}')
  } catch {
    return {}
  }
})()

function remember(lang: Lang, reason: string | null) {
  if ((failed[lang] ?? null) === reason) return
  failed = { ...failed, [lang]: reason ?? undefined }
  try {
    localStorage.setItem(FAILED_KEY, JSON.stringify(failed))
  } catch {
    /* best effort */
  }
  notify()
}

export function forgetSpeechFailures(): void {
  failed = {}
  try {
    localStorage.removeItem(FAILED_KEY)
  } catch {
    /* best effort */
  }
  notify()
}

const ctor = (): RecognitionCtor | undefined =>
  (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition

export const recognitionSupported = (): boolean => typeof window !== 'undefined' && !!ctor()

/** Why speaking exercises are unavailable, if they are. */
export function speakingBlockedBy(lang: Lang): 'unsupported' | 'blocked' | null {
  if (!recognitionSupported()) return 'unsupported'
  return failed[lang] ? 'blocked' : null
}

export function speakingAvailable(lang: Lang): boolean {
  if (mode === 'off') return false
  if (!recognitionSupported()) return false
  if (mode === 'on') return true
  return !failed[lang]
}

export function useSpeaking(lang: Lang): boolean {
  const [ok, setOk] = useState(() => speakingAvailable(lang))
  useEffect(() => {
    const update = () => setOk(speakingAvailable(lang))
    update()
    listeners.add(update)
    return () => void listeners.delete(update)
  }, [lang])
  return ok
}

export interface HeardResult {
  /** what the browser understood, best guess first (empty when nothing was heard) */
  alternatives: string[]
  error: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'other' | null
}

const FATAL = new Set(['not-allowed', 'service-not-allowed', 'language-not-supported', 'audio-capture'])

/** Listens once and resolves with what the browser heard. `stop()` ends the attempt early. */
export function listen(lang: Lang): { result: Promise<HeardResult>; stop: () => void } {
  const Ctor = ctor()
  if (!Ctor) return { result: Promise.resolve({ alternatives: [], error: 'unsupported' }), stop: () => {} }

  const rec = new Ctor()
  rec.lang = locale[lang]
  rec.continuous = false
  rec.interimResults = false
  rec.maxAlternatives = 5

  let settled = false
  let stopped = false
  const result = new Promise<HeardResult>((resolve) => {
    const done = (r: HeardResult) => {
      if (settled) return
      settled = true
      if (r.error && FATAL.has(r.error)) remember(lang, r.error)
      else if (!r.error) remember(lang, null)
      resolve(r)
    }

    rec.addEventListener('result', (e: Event) => {
      const list = (e as unknown as { results: ArrayLike<ArrayLike<{ transcript: string }>> }).results
      const first = list[0]
      const alternatives = Array.from({ length: first.length }, (_, i) => first[i].transcript.trim()).filter(Boolean)
      done({ alternatives, error: null })
    })
    rec.addEventListener('error', (e: Event) => {
      const code = (e as unknown as { error?: string }).error ?? 'other'
      const known = ['not-allowed', 'no-speech', 'network', 'service-not-allowed', 'audio-capture'].includes(code)
      done({ alternatives: [], error: known ? (code === 'service-not-allowed' || code === 'audio-capture' ? 'not-allowed' : (code as HeardResult['error'])) : 'other' })
    })
    rec.addEventListener('end', () => done({ alternatives: [], error: stopped ? 'no-speech' : 'no-speech' }))

    try {
      rec.start()
    } catch {
      done({ alternatives: [], error: 'other' })
    }
  })

  return {
    result,
    stop: () => {
      stopped = true
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    },
  }
}
