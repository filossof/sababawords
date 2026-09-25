import type { Course, Lang, LessonDef, LevelKind, Unit, Word, Writing } from '../types'
import { UNIT_SPECS, type UnitSpec } from './units'

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

function buildUnit(spec: UnitSpec, lang: Lang): Unit {
  const words = lines(spec.words).map((line, i): Word => {
    const [he, en, ar, arTranslit, bg, bgTranslit, pic] = line.split('|')
    const target = { en, ar, bg }[lang]
    return {
      id: `${lang}-${spec.id}-w${i}`,
      target,
      he,
      translit: { en: undefined, ar: arTranslit, bg: bgTranslit }[lang],
      pic: pic || undefined,
    }
  })
  const sentences = lines(spec.sentences).map((line, i): Word => {
    const [he, en, ar, bg] = line.split('|')
    return { id: `${lang}-${spec.id}-s${i}`, target: { en, ar, bg }[lang], he, sentence: true }
  })
  return { id: `${lang}-${spec.id}`, title: spec.title, emoji: spec.emoji, color: spec.color, words, sentences }
}

const build = (lang: Lang): Course => ({ lang, units: UNIT_SPECS.map((s) => buildUnit(s, lang)) })

export const courses: Record<Lang, Course> = { en: build('en'), ar: build('ar'), bg: build('bg') }

export const langInfo: Record<Lang, { he: string; native: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { he: 'אנגלית', native: 'English', flag: '🇬🇧', dir: 'ltr' },
  ar: { he: 'ערבית', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  bg: { he: 'בולגרית', native: 'Български', flag: '🇧🇬', dir: 'ltr' },
}

export const LANGS = Object.keys(langInfo) as Lang[]

/** "באנגלית" / "בערבית" / "בבולגרית" – for exercise titles. */
export const inLang = (lang: Lang) => `ב${langInfo[lang].he}`
/** "לאנגלית" / "לערבית" / "לבולגרית" */
export const toLang = (lang: Lang) => `ל${langInfo[lang].he}`

/**
 * Writing is introduced gradually: recognition only at first, then letter tiles, then typing.
 * Languages with an unfamiliar alphabet start writing later; Arabic letters change shape by
 * position, so letter tiles are skipped there and typing comes last.
 */
function writingFor(lang: Lang, unitIndex: number): Writing {
  if (lang === 'en') return unitIndex < 2 ? 'none' : unitIndex < 5 ? 'scramble' : 'type'
  if (lang === 'bg') return unitIndex < 3 ? 'none' : unitIndex < 6 ? 'scramble' : 'type'
  return unitIndex < 6 ? 'none' : 'type'
}

/** The 8 levels of every unit: [kind, title, icon, word range, sentence range]. */
const LEVEL_PLAN: [LevelKind, string, string, [number, number], [number, number]][] = [
  ['meet', 'מילים 1', '🌱', [0, 4], [0, 0]],
  ['meet', 'מילים 2', '🌿', [4, 8], [0, 0]],
  ['meet', 'מילים 3', '🍀', [8, 12], [0, 0]],
  ['review', 'חזרה', '🔁', [0, 12], [0, 0]],
  ['sentIntro', 'משפטים 1', '💬', [0, 0], [0, 3]],
  ['sentIntro', 'משפטים 2', '🗨️', [0, 0], [3, 6]],
  ['sentPractice', 'תרגול משפטים', '🎧', [0, 0], [0, 6]],
  ['challenge', 'אתגר', '🏆', [0, 12], [0, 6]],
]

export const LEVELS_PER_UNIT = LEVEL_PLAN.length

export function unitLevels(course: Course, unit: Unit): LessonDef[] {
  const unitWriting = writingFor(course.lang, course.units.indexOf(unit))
  return LEVEL_PLAN.map(([kind, title, icon, w, s], i) => ({
    id: `${unit.id}-${i + 1}`,
    title,
    icon,
    kind,
    unit,
    words: unit.words.slice(...w),
    sentences: unit.sentences.slice(...s),
    // writing only shows up in the review and the challenge
    writing: kind === 'review' || kind === 'challenge' ? unitWriting : 'none',
  }))
}

export function allLessons(course: Course): LessonDef[] {
  return course.units.flatMap((u) => unitLevels(course, u))
}

export function allWords(course: Course): Word[] {
  return course.units.flatMap((u) => u.words)
}
