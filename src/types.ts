export type Lang = 'en' | 'ar'

/** A vocabulary word – or a whole sentence (`sentence: true`), which the exercises treat the same way. */
export interface Word {
  id: string
  /** the text in the language being learned */
  target: string
  /** Hebrew meaning */
  he: string
  /** Hebrew-letter transliteration (Arabic only) */
  translit?: string
  /** a picture (emoji) that shows the meaning */
  pic?: string
  sentence?: boolean
}

export interface Unit {
  id: string
  title: string
  emoji: string
  /** theme colour */
  color: string
  words: Word[]
  sentences: Word[]
}

export interface Course {
  lang: Lang
  units: Unit[]
}

/** How much the learner has to write: nothing, arrange letter tiles, or type the whole word. */
export type Writing = 'none' | 'scramble' | 'type'

/** What a level (lesson) is about. Every unit has 8: three word intros, a review, two sentence intros, sentence practice, a challenge. */
export type LevelKind = 'meet' | 'review' | 'sentIntro' | 'sentPractice' | 'challenge'

export interface LessonDef {
  id: string
  title: string
  icon: string
  kind: LevelKind
  unit: Unit
  /** the words this level is about */
  words: Word[]
  /** the sentences this level is about */
  sentences: Word[]
  writing: Writing
}

export type Exercise =
  | { kind: 'flashcard'; word: Word }
  | { kind: 'mc'; word: Word; dir: 'toHe' | 'toTarget'; options: Word[] }
  | { kind: 'listen'; word: Word; options: Word[] }
  /** see/hear the word, pick its picture */
  | { kind: 'pic'; word: Word; options: Word[] }
  | { kind: 'match'; pairs: Word[] }
  | { kind: 'type'; word: Word }
  | { kind: 'scramble'; word: Word }
  /** build a sentence from word tiles; `word` is the sentence. listen = hear it, then build it */
  | { kind: 'bank'; word: Word; dir: 'toTarget' | 'toHe' | 'listen'; tokens: string[] }
