import type { Exercise, Word } from '../types'

export type Rng = () => number

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

/** The text shown as the correct answer when the learner is wrong. */
export function answerOf(ex: Exercise): { text: string; lang: 'he' | 'target' } | null {
  switch (ex.kind) {
    case 'mc':
      return ex.dir === 'toHe' ? { text: ex.word.he, lang: 'he' } : { text: ex.word.target, lang: 'target' }
    case 'listen':
      return { text: ex.word.he, lang: 'he' }
    case 'pic':
      return { text: `${ex.word.pic ?? ''} ${ex.word.target}`.trim(), lang: 'target' }
    case 'bank':
      return ex.dir === 'toHe' ? { text: ex.word.he, lang: 'he' } : { text: ex.word.target, lang: 'target' }
    case 'type':
    case 'scramble':
      return { text: ex.word.target, lang: 'target' }
    default:
      return null
  }
}
