export type Lang = 'en' | 'ar'

export interface Word {
  id: string
  /** the word in the language being learned */
  target: string
  /** Hebrew meaning */
  he: string
  /** Hebrew-letter transliteration (Arabic only) */
  translit?: string
}

export interface Unit {
  id: string
  title: string
  emoji: string
  words: Word[]
}

export interface Course {
  lang: Lang
  units: Unit[]
}

export interface LessonDef {
  id: string
  title: string
  words: Word[]
  /** show flashcards introducing the words first */
  intro: boolean
}

export type Exercise =
  | { kind: 'flashcard'; word: Word }
  | { kind: 'mc'; word: Word; dir: 'toHe' | 'toTarget'; options: Word[] }
  | { kind: 'listen'; word: Word; options: Word[] }
  | { kind: 'match'; pairs: Word[] }
  | { kind: 'type'; word: Word }
