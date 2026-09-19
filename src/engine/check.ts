import type { Lang } from '../types'

/** Lenient comparison: ignores case, spacing, punctuation, and (for Arabic) diacritics and alef variants. */
export function normalize(text: string, lang: Lang): string {
  let t = text.trim().replace(/\s+/g, ' ')
  if (lang === 'en') {
    t = t.toLowerCase().replace(/[.,!?]/g, '')
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
