import type { Exercise, Word, Writing } from '../types'
import { canScramble } from './check'

export type Rng = () => number

export interface GenOptions {
  /** listening exercises are only generated when a voice for the language exists */
  audio: boolean
  /** start with flashcards that introduce the words */
  intro: boolean
  /** how much the learner has to write in this lesson */
  writing: Writing
  rng?: Rng
}

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Wrong options must differ from the answer in both languages (no duplicate translations). */
export function pickOptions(word: Word, pool: Word[], count: number, rng: Rng): Word[] {
  const seenHe = new Set([word.he])
  const seenTarget = new Set([word.target])
  const distractors: Word[] = []
  for (const w of shuffle(pool, rng)) {
    if (distractors.length >= count - 1) break
    if (seenHe.has(w.he) || seenTarget.has(w.target)) continue
    seenHe.add(w.he)
    seenTarget.add(w.target)
    distractors.push(w)
  }
  return shuffle([word, ...distractors], rng)
}

/**
 * Builds a lesson: intro flashcards → multiple choice (both directions) → matching
 * → listening → (optional) letter tiles or typing. `pool` supplies distractors (the whole course).
 */
export function generateLesson(words: Word[], pool: Word[], opts: GenOptions): Exercise[] {
  const rng = opts.rng ?? Math.random
  const out: Exercise[] = []

  if (opts.intro) {
    for (const word of words) out.push({ kind: 'flashcard', word })
  }

  const mc: Exercise[] = []
  for (const word of words) {
    mc.push({ kind: 'mc', word, dir: 'toHe', options: pickOptions(word, pool, 4, rng) })
    mc.push({ kind: 'mc', word, dir: 'toTarget', options: pickOptions(word, pool, 4, rng) })
  }
  out.push(...shuffle(mc, rng))

  out.push({ kind: 'match', pairs: shuffle(words, rng).slice(0, 5) })

  if (opts.audio) {
    for (const word of shuffle(words, rng)) {
      out.push({ kind: 'listen', word, options: pickOptions(word, pool, 4, rng) })
    }
  }

  if (opts.writing === 'type') {
    for (const word of shuffle(words, rng)) out.push({ kind: 'type', word })
  } else if (opts.writing === 'scramble') {
    for (const word of shuffle(words, rng)) if (canScramble(word.target)) out.push({ kind: 'scramble', word })
  }

  return out
}

/** The text shown as the correct answer when the learner is wrong. */
export function answerOf(ex: Exercise): { text: string; lang: 'he' | 'target' } | null {
  switch (ex.kind) {
    case 'mc':
      return ex.dir === 'toHe' ? { text: ex.word.he, lang: 'he' } : { text: ex.word.target, lang: 'target' }
    case 'listen':
      return { text: ex.word.he, lang: 'he' }
    case 'type':
    case 'scramble':
      return { text: ex.word.target, lang: 'target' }
    default:
      return null
  }
}
