import type { Lang, Word } from '../types'
import { normalize } from './check'

const HEBREW = /[֐-׿]/
const ARABIC = /[؀-ۿ]/

export interface SkippedLine {
  line: number
  text: string
  reason: string
}

export interface ParseResult {
  words: Word[]
  skipped: SkippedLine[]
}

/** Separators in priority order; the first one found in a line splits it. */
const SEPARATORS = [/\t/, /\s[-–—]\s/, /[=;:]/, /,/]

function splitLine(line: string): [string, string] | null {
  for (const sep of SEPARATORS) {
    const m = sep.exec(line)
    if (m) return [line.slice(0, m.index), line.slice(m.index + m[0].length)]
  }
  return null
}

const clean = (s: string) => s.trim().replace(/^["“”']+|["“”']+$/g, '').trim()

export const wordId = (target: string, lang: Lang) => `w:${normalize(target, lang)}`

/**
 * Parses pasted text or CSV: one `word - translation` pair per line, in either order –
 * the Hebrew side is detected automatically.
 */
export function parseVocab(text: string, lang: Lang): ParseResult {
  const words: Word[] = []
  const skipped: SkippedLine[] = []
  const seen = new Set<string>()

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    const skip = (reason: string) => skipped.push({ line: i + 1, text: line, reason })

    const parts = splitLine(line)
    if (!parts) return skip('לא נמצא מפריד בין המילה לתרגום (למשל " - ")')
    const [left, right] = [clean(parts[0]), clean(parts[1])]
    if (!left || !right) return skip('חסרה מילה או תרגום')

    const leftHe = HEBREW.test(left)
    const rightHe = HEBREW.test(right)
    if (leftHe === rightHe) return skip(leftHe ? 'שני הצדדים בעברית' : 'לא נמצא תרגום בעברית')
    const [he, target] = leftHe ? [left, right] : [right, left]

    if (lang === 'en' && !/[a-z]/i.test(target)) return skip('המילה אינה באנגלית')
    if (lang === 'ar' && !ARABIC.test(target)) return skip('המילה אינה בערבית')

    const id = wordId(target, lang)
    if (seen.has(id)) return skip('מילה כפולה')
    seen.add(id)
    words.push({ id, target, he })
  })

  return { words, skipped }
}
