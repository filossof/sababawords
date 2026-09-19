import type { Lang } from '../types'

/** Lenient comparison: ignores case, spacing, punctuation, and (for Arabic) diacritics and alef variants. */
export function normalize(text: string, lang: Lang): string {
  let t = text.trim().replace(/\s+/g, ' ')
  if (lang === 'en') {
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
  return lang === 'en' ? /^[a-z' -]+$/.test(t) : /^[\u0600-\u06FF ]+$/.test(t)
}

/** Letter-tile exercises: a single English word of a sensible length. */
export function canScramble(target: string): boolean {
  return /^[a-z]{3,12}$/i.test(target.trim())
}
