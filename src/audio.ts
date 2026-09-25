import { useEffect, useState } from 'react'
import type { Lang } from './types'

const locale: Record<Lang, string> = { en: 'en-US', ar: 'ar-SA', bg: 'bg-BG' }

/** Voices that are jokes or sound effects (macOS "novelty" voices) – they mispronounce ordinary words. */
const NOVELTY =
  /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Junior|Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Kathy|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley)\b/i

/** Natural-sounding voices, best first. */
const PREFERRED = /Daria|Samantha|Google US English|Aria|Jenny|Ava|Allison|Alex|Susan|Zira|Google UK English|Daniel|Karen|Moira|Tessa|Natural|Neural|Premium|Enhanced/i

let preferred: Partial<Record<Lang, string>> = {}

/** The app tells us which voice the user picked (by name); empty = automatic. */
export function setVoicePreferences(p: Partial<Record<Lang, string>>): void {
  preferred = p
}

function voicesFor(lang: Lang): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return []
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang))
}

function score(v: SpeechSynthesisVoice, lang: Lang): number {
  let s = 0
  if (NOVELTY.test(v.name)) s -= 100
  const match = PREFERRED.exec(v.name)
  if (match) s += 50
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

/** True when the device has a text-to-speech voice for the language (voices load asynchronously). */
export function useVoice(lang: Lang): boolean {
  const [ok, setOk] = useState(() => voicesFor(lang).length > 0)
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const update = () => setOk(voicesFor(lang).length > 0)
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [lang])
  return ok
}

/** Re-renders when the device finishes loading its voice list. */
export function useVoiceList(lang: Lang): SpeechSynthesisVoice[] {
  const [list, setList] = useState(() => listVoices(lang))
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const update = () => setList(listVoices(lang))
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [lang])
  return list
}

export function speak(text: string, lang: Lang): void {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = pickVoice(lang)
  u.lang = voice?.lang ?? locale[lang]
  if (voice) u.voice = voice
  u.rate = 0.85
  speechSynthesis.speak(u)
}
