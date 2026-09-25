import type { Lang } from '../types'

/** Lenient comparison: ignores case, spacing, punctuation, and (for Arabic) diacritics and alef variants. */
export function normalize(text: string, lang: Lang): string {
  let t = text.trim().replace(/\s+/g, ' ')
  if (lang === 'en' || lang === 'bg') {
    t = t.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?]/g, '')
  } else {
    t = t
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
  }
  return t
}

export function isCorrectTyped(input: string, target: string, lang: Lang): boolean {
  return normalize(input, lang) === normalize(target, lang)
}

/** Can the on-screen keyboard produce this word? (If not, typing exercises are skipped for it.) */
export function canType(target: string, lang: Lang): boolean {
  const t = normalize(target, lang)
  if (!t) return false
  if (lang === 'en') return /^[a-z' -]+$/.test(t)
  if (lang === 'bg') return /^[\u0430-\u044F ]+$/.test(t)
  return /^[\u0600-\u06FF ]+$/.test(t)
}

/**
 * Letter-tile exercises: a single word of a sensible length, in an alphabet whose letters keep
 * their shape on their own (Arabic letters change shape by position, so it is skipped there).
 */
export function canScramble(target: string, lang: Lang): boolean {
  const t = target.trim()
  if (lang === 'en') return /^[a-z]{3,12}$/i.test(t)
  if (lang === 'bg') return /^[\u0410-\u044F]{3,12}$/.test(t)
  return false
}

/** Sentences match ignoring case, punctuation (incl. Arabic ؟ ،) and extra spaces. */
export function sameSentence(a: string, b: string, lang: Lang | 'he'): boolean {
  const strip = (t: string) =>
    (lang === 'he' ? t : normalize(t, lang)).replace(/[.,!?؟،:;"]/g, '').replace(/\s+/g, ' ').trim()
  return strip(a) === strip(b)
}
