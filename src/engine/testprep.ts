import type { Exercise, Lang, Word } from '../types'
import { canScramble, canType } from './check'
import { pickOptions, shuffle, type Rng } from './generate'
import { MAX_QUESTIONS } from './level'

export const MIN_QUESTIONS = 8

export type PrepKind = 'meet' | 'recognize' | 'match' | 'spell' | 'weak'

export interface PrepLesson {
  id: string
  title: string
  kind: PrepKind
  words: Word[]
}

export interface PrepLevel {
  id: string
  title: string
  emoji: string
  blurb: string
  lessons: PrepLesson[]
}

/** Splits into evenly sized groups of at most `max` (so no level is left with a tiny leftover group). */
export function chunkEven<T>(items: T[], max: number): T[][] {
  const groups = Math.max(1, Math.ceil(items.length / max))
  const base = Math.floor(items.length / groups)
  const extra = items.length % groups
  const out: T[][] = []
  let at = 0
  for (let g = 0; g < groups; g++) {
    const size = base + (g < extra ? 1 : 0)
    out.push(items.slice(at, at + size))
    at += size
  }
  return out
}

/** Words per lesson, chosen so a lesson has 8–12 questions. */
const LEVELS: { kind: Exclude<PrepKind, 'weak'>; title: string; emoji: string; blurb: string; max: (lang: Lang) => number }[] = [
  { kind: 'meet', title: 'הכירו את המילים', emoji: '👀', blurb: 'כרטיסיות עם הקראה ושאלות קלות', max: () => 6 },
  { kind: 'recognize', title: 'זיהוי', emoji: '🎯', blurb: 'מה המשמעות – ובחזרה', max: () => 6 },
  { kind: 'match', title: 'התאמה והאזנה', emoji: '🎧', blurb: 'זוגות ושמיעה', max: () => 10 },
  { kind: 'spell', title: 'כתיבה', emoji: '✍️', blurb: 'איות והקלדה', max: (lang) => (lang === 'en' ? 6 : 10) },
]

/** The four practice levels; the mock test (level 5) is separate and always available. */
export function buildLevels(words: Word[], lang: Lang): PrepLevel[] {
  return LEVELS.map((lv, li) => ({
    id: lv.kind,
    title: `${li + 1}. ${lv.title}`,
    emoji: lv.emoji,
    blurb: lv.blurb,
    lessons: chunkEven(words, lv.max(lang)).map((group, i, all) => ({
      id: `${lv.kind}-${i + 1}`,
      title: all.length === 1 ? 'תרגול' : `חלק ${i + 1}`,
      kind: lv.kind,
      words: group,
    })),
  }))
}

export interface PrepOptions {
  lang: Lang
  audio: boolean
  rng?: Rng
}

export function generatePrepLesson(kind: PrepKind, words: Word[], pool: Word[], opts: PrepOptions): Exercise[] {
  const rng = opts.rng ?? Math.random
  const mc = (word: Word, dir: 'toHe' | 'toTarget'): Exercise => ({
    kind: 'mc',
    word,
    dir,
    options: pickOptions(word, pool, 4, rng),
  })
  const out: Exercise[] = []
  /** every lesson has 8–12 questions: pad short ones with extra multiple choice, trim long ones */
  const fit = (list: Exercise[]): Exercise[] => {
    for (let i = 0; list.length < MIN_QUESTIONS && words.length; i++) list.push(mc(words[i % words.length], i % 2 ? 'toTarget' : 'toHe'))
    return list.slice(0, MAX_QUESTIONS)
  }

  switch (kind) {
    case 'meet':
      for (const word of words) out.push({ kind: 'flashcard', word })
      for (const word of shuffle(words, rng)) out.push(mc(word, 'toHe'))
      break

    case 'recognize':
      out.push(...shuffle(words.flatMap((w) => [mc(w, 'toHe'), mc(w, 'toTarget')]), rng))
      break

    case 'match':
      for (const group of chunkEven(shuffle(words, rng), 5)) out.push({ kind: 'match', pairs: group })
      for (const word of shuffle(words, rng)) {
        out.push(
          opts.audio
            ? { kind: 'listen', word, options: pickOptions(word, pool, 4, rng) }
            : mc(word, 'toTarget'),
        )
      }
      break

    case 'spell': {
      const shuffled = shuffle(words, rng)
      if (opts.lang === 'en') {
        for (const word of shuffled) if (canScramble(word.target)) out.push({ kind: 'scramble', word })
      }
      for (const word of shuffled) {
        out.push(canType(word.target, opts.lang) ? { kind: 'type', word } : mc(word, 'toTarget'))
      }
      break
    }

    case 'weak':
      for (const word of words) {
        out.push(mc(word, 'toHe'), mc(word, 'toTarget'))
        if (canType(word.target, opts.lang)) out.push({ kind: 'type', word })
      }
      return fit(shuffle(out, rng))
  }
  return fit(out)
}

export const MOCK_MAX_QUESTIONS = 30

/** A test-like question set: every word once, in mixed formats (multiple choice both ways, typing). */
export function generateMock(words: Word[], pool: Word[], lang: Lang, rng: Rng = Math.random): Exercise[] {
  return shuffle(words, rng)
    .slice(0, MOCK_MAX_QUESTIONS)
    .map((word, i): Exercise => {
      const options = pickOptions(word, pool, 4, rng)
      if (i % 3 === 0) return { kind: 'mc', word, dir: 'toHe', options }
      if (i % 3 === 2 && canType(word.target, lang)) return { kind: 'type', word }
      return { kind: 'mc', word, dir: 'toTarget', options }
    })
}
