export interface WordStat {
  /** Leitner box: 0 = just missed … MASTERED_BOX = known well */
  box: number
  wrong: number
  /** YYYY-MM-DD – when the word should come back for practice */
  due: string
}

export const MASTERED_BOX = 3
/** days until the next review, by box */
const INTERVAL_DAYS = [0, 1, 3, 7]

export const dayString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return dayString(d)
}

export function applyResults(
  stats: Record<string, WordStat>,
  practiced: string[],
  missed: string[],
): Record<string, WordStat> {
  const out = { ...stats }
  const missedSet = new Set(missed)
  for (const id of practiced) {
    const prev = out[id] ?? { box: 0, wrong: 0, due: dayString(new Date()) }
    if (missedSet.has(id)) out[id] = { box: 0, wrong: prev.wrong + 1, due: addDays(0) }
    else {
      const box = Math.min(MASTERED_BOX, prev.box + 1)
      out[id] = { ...prev, box, due: addDays(INTERVAL_DAYS[box]) }
    }
  }
  return out
}

/** Words to practice: missed words not yet mastered, plus words whose review date has come. */
export function weakWordIds(ids: string[], stats: Record<string, WordStat>): string[] {
  const today = dayString(new Date())
  return ids
    .filter((id) => {
      const s = stats[id]
      return s && s.box < MASTERED_BOX && (s.wrong > 0 || s.due <= today)
    })
    .sort((a, b) => stats[a].box - stats[b].box)
}

export const masteredCount = (ids: string[], stats: Record<string, WordStat>) =>
  ids.filter((id) => (stats[id]?.box ?? 0) >= MASTERED_BOX).length
