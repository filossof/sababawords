import type { Exercise, Lang, Word } from '../types'
import { canScramble, canType } from './check'
import { pickOptions, shuffle, type Rng } from './generate'

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

/** Splits into groups of about `size`; a tiny leftover group is merged into the previous one. */
export function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = []
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size))
  if (groups.length > 1 && groups[groups.length - 1].length < 3) {
    const tail = groups.pop()!
    groups[groups.length - 1].push(...tail)
  }
  return groups
}

const LEVELS: { kind: Exclude<PrepKind, 'weak'>; title: string; emoji: string; blurb: string; size: number }[] = [
  { kind: 'meet', title: 'הכירו את המילים', emoji: '👀', blurb: 'כרטיסיות עם הקראה ושאלות קלות', size: 6 },
  { kind: 'recognize', title: 'זיהוי', emoji: '🎯', blurb: 'מה המשמעות – ובחזרה', size: 10 },
  { kind: 'match', title: 'התאמה והאזנה', emoji: '🎧', blurb: 'זוגות ושמיעה', size: 10 },
  { kind: 'spell', title: 'כתיבה', emoji: '✍️', blurb: 'איות והקלדה', size: 8 },
]

/** The four practice levels; the mock test (level 5) is separate and always available. */
export function buildLevels(words: Word[]): PrepLevel[] {
  return LEVELS.map((lv, li) => ({
    id: lv.kind,
    title: `${li + 1}. ${lv.title}`,
    emoji: lv.emoji,
    blurb: lv.blurb,
    lessons: chunk(words, lv.size).map((group, i, all) => ({
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

  switch (kind) {
    case 'meet':
      for (const word of words) out.push({ kind: 'flashcard', word })
      for (const word of shuffle(words, rng)) out.push(mc(word, 'toHe'))
      break

    case 'recognize':
      out.push(...shuffle(words.flatMap((w) => [mc(w, 'toHe'), mc(w, 'toTarget')]), rng))
      break

    case 'match':
      for (const group of chunk(shuffle(words, rng), 5)) out.push({ kind: 'match', pairs: group })
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
      return shuffle(out, rng)
  }
  return out
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
