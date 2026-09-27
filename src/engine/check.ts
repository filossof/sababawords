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

/** Edit distance between two strings (how many single-character changes turn one into the other). */
function editDistance(a: string, b: string): number {
  if (a === b) return 0
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[b.length]
}

/** 0-1: how close two texts are, ignoring case, punctuation and (for Arabic) diacritics. */
export function similarity(a: string, b: string, lang: Lang): number {
  const [x, y] = [normalize(a, lang), normalize(b, lang)]
  if (!x || !y) return 0
  if (x === y) return 1
  return 1 - editDistance(x, y) / Math.max(x.length, y.length)
}

/**
 * Was the word/sentence pronounced well enough? Speech recognition is approximate and kids'
 * voices are harder for it, so we accept the best of its guesses and allow a small slip:
 * a near-match on a short word, or most of the words of a sentence.
 */
export function matchesSpoken(
  heard: string[],
  expected: string,
  lang: Lang,
): { ok: boolean; best: string; score: number } {
  const target = normalize(expected, lang)
  const words = target.split(' ').filter(Boolean)
  let best = ''
  let score = 0
  for (const candidate of heard) {
    const direct = similarity(candidate, expected, lang)
    // a sentence counts if most of its words are in there, even when the rest is misheard
    const said = normalize(candidate, lang)
    const covered = words.length > 1 ? words.filter((w) => said.includes(w)).length / words.length : 0
    const value = Math.max(direct, covered)
    if (value > score) {
      score = value
      best = candidate
    }
  }
  const threshold = words.length > 1 ? 0.7 : target.length <= 4 ? 0.75 : 0.8
  return { ok: score >= threshold, best: best || (heard[0] ?? ""), score }
}
