import type { Exercise, Lang, LessonDef, Word, Writing } from '../types'
import { canScramble, canType } from './check'
import { pickOptions, shuffle, type Rng } from './generate'

/** A level never shows more than this many questions – retries of missed questions fit inside it too. */
export const MAX_QUESTIONS = 12

export interface LevelContext {
  lang: Lang
  /** listening exercises only exist when the device has a voice for the language */
  audio: boolean
  rng?: Rng
}

const flash = (word: Word): Exercise => ({ kind: 'flashcard', word })

/** Picture options: every option has its own picture, and none repeats the meaning of another. */
function picOptions(word: Word, pool: Word[], rng: Rng): Word[] {
  const pics = new Set([word.pic])
  const he = new Set([word.he])
  const out: Word[] = []
  for (const w of shuffle(pool, rng)) {
    if (out.length >= 3) break
    if (!w.pic || pics.has(w.pic) || he.has(w.he)) continue
    pics.add(w.pic)
    he.add(w.he)
    out.push(w)
  }
  return shuffle([word, ...out], rng)
}

/** Answer tokens plus a couple of wrong tokens taken from the unit's other sentences. */
function bankTokens(sentence: Word, dir: 'toTarget' | 'toHe' | 'listen', pool: Word[], rng: Rng): string[] {
  const text = (s: Word) => (dir === 'toHe' ? s.he : s.target)
  const answer = text(sentence).split(/\s+/)
  const have = new Set(answer)
  const extras = [
    ...new Set(
      shuffle(
        pool.filter((s) => s.id !== sentence.id).flatMap((s) => text(s).split(/\s+/)),
        rng,
      ).filter((t) => !have.has(t)),
    ),
  ].slice(0, answer.length >= 6 ? 3 : 2)
  return shuffle([...answer, ...extras], rng)
}

/** Builds the exercises for one level of a unit. Always 8–12 questions (normally 9–10). */
export function generateLevel(def: LessonDef, ctx: LevelContext): Exercise[] {
  const rng = ctx.rng ?? Math.random
  const wordPool = def.unit.words
  const sentPool = def.unit.sentences

  const mcHe = (w: Word): Exercise => ({ kind: 'mc', word: w, dir: 'toHe', options: pickOptions(w, wordPool, 4, rng) })
  const mcTo = (w: Word): Exercise => ({ kind: 'mc', word: w, dir: 'toTarget', options: pickOptions(w, wordPool, 4, rng) })
  const pic = (w: Word): Exercise => {
    const options = w.pic ? picOptions(w, wordPool, rng) : []
    return options.length >= 3 ? { kind: 'pic', word: w, options } : mcTo(w)
  }
  const listenOr = (w: Word, fallback: (w: Word) => Exercise): Exercise =>
    ctx.audio ? { kind: 'listen', word: w, options: pickOptions(w, wordPool, 4, rng) } : fallback(w)
  const mcS = (s: Word, dir: 'toHe' | 'toTarget' = 'toHe'): Exercise => ({
    kind: 'mc',
    word: s,
    dir,
    options: pickOptions(s, sentPool, 4, rng),
  })
  const bank = (s: Word, dir: 'toTarget' | 'toHe' | 'listen'): Exercise =>
    dir === 'listen' && !ctx.audio ? mcS(s) : { kind: 'bank', word: s, dir, tokens: bankTokens(s, dir, sentPool, rng) }
  const writing = (w: Word, how: Writing, fallback: (w: Word) => Exercise): Exercise => {
    if (how === 'type' && canType(w.target, ctx.lang)) return { kind: 'type', word: w }
    if (how === 'scramble' && canScramble(w.target)) return { kind: 'scramble', word: w }
    return fallback(w)
  }
  const match = (ws: Word[]): Exercise => ({ kind: 'match', pairs: shuffle(ws, rng) })

  switch (def.kind) {
    case 'meet': {
      // 4 new words: cards first, then one question per word in a different style, then a matching round
      const styles = [mcHe, pic, mcTo, (w: Word) => listenOr(w, mcHe)]
      const questions = def.words.map((w, i) => styles[i % styles.length](w))
      return [...def.words.map(flash), ...shuffle(questions, rng), match(def.words)]
    }

    case 'review': {
      const ws = shuffle(def.words, rng)
      const how = def.writing
      return [
        mcHe(ws[0]),
        pic(ws[1]),
        mcTo(ws[2]),
        match(ws.slice(0, 5)),
        listenOr(ws[3], mcHe),
        listenOr(ws[4], pic),
        match(ws.slice(5, 10)),
        writing(ws[5], how, mcTo),
        writing(ws[6], how, pic),
        writing(ws[7], how, mcHe),
      ]
    }

    case 'sentIntro': {
      const ss = def.sentences
      return [
        ...ss.map(flash),
        ...ss.map((s, i) => mcS(s, i === 1 ? 'toTarget' : 'toHe')),
        ...ss.map((s) => bank(s, 'toTarget')),
      ]
    }

    case 'sentPractice': {
      const ss = shuffle(def.sentences, rng)
      return [
        mcS(ss[4]),
        mcS(ss[5], 'toTarget'),
        bank(ss[0], 'toTarget'),
        bank(ss[1], 'toTarget'),
        bank(ss[2], 'toTarget'),
        bank(ss[0], 'listen'),
        bank(ss[3], 'listen'),
        bank(ss[3], 'toHe'),
        bank(ss[4], 'toHe'),
        bank(ss[5], 'toHe'),
      ]
    }

    case 'challenge': {
      const ws = shuffle(def.words, rng)
      const ss = shuffle(def.sentences, rng)
      const how = def.writing
      return [
        mcHe(ws[0]),
        mcTo(ws[1]),
        pic(ws[2]),
        listenOr(ws[3], pic),
        mcS(ss[0]),
        bank(ss[1], 'toTarget'),
        bank(ss[2], 'toHe'),
        bank(ss[3], 'toTarget'),
        writing(ws[4], how, mcTo),
        writing(ws[5], how, pic),
      ]
    }
  }
}
