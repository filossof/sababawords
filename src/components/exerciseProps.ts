import type { Lang } from '../types'

export interface ExerciseProps {
  lang: Lang
  showTranslit: boolean
  /** report the result; the player decides what happens next */
  onDone: (correct: boolean) => void
}
