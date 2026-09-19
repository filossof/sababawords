import type { Exercise, Lang } from './types'

/** Everything the lesson player needs to run one lesson and record the result. */
export interface PlaySession {
  lang: Lang
  /** colour + emoji used for the lesson screens */
  theme?: { color: string; emoji: string }
  /** builds a fresh set of exercises (called again on retry) */
  make: () => Exercise[]
  onComplete: (xp: number, accuracy: number, missed: string[]) => void
}
