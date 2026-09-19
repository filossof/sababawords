import { useEffect, useState } from 'react'
import type { Lang } from './types'

const locale: Record<Lang, string> = { en: 'en-US', ar: 'ar-SA' }

function hasVoiceFor(lang: Lang): boolean {
  if (typeof speechSynthesis === 'undefined') return false
  return speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(lang))
}

/** True when the device has a text-to-speech voice for the language (voices load asynchronously). */
export function useVoice(lang: Lang): boolean {
  const [ok, setOk] = useState(() => hasVoiceFor(lang))
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const update = () => setOk(hasVoiceFor(lang))
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [lang])
  return ok
}

export function speak(text: string, lang: Lang): void {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = locale[lang]
  u.rate = 0.85
  const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
}
