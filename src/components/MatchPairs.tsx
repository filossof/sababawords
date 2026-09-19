import { useMemo, useState } from 'react'
import { shuffle } from '../engine/generate'
import { sfx } from '../sound'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Txt } from './Txt'

export function MatchPairs({ pairs, lang, onDone }: ExerciseProps & { pairs: Word[] }) {
  const targets = useMemo(() => shuffle(pairs), [pairs])
  const meanings = useMemo(() => shuffle(pairs), [pairs])
  const [selT, setSelT] = useState<string | null>(null)
  const [selH, setSelH] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState(false)
  const [mistakes, setMistakes] = useState(false)

  function attempt(t: string, h: string) {
    if (t === h) {
      sfx.match()
      const next = new Set(matched).add(t)
      setMatched(next)
      setSelT(null)
      setSelH(null)
      if (next.size === pairs.length) setTimeout(() => onDone(!mistakes), 500)
    } else {
      sfx.wrong()
      setMistakes(true)
      setFlash(true)
      setTimeout(() => {
        setFlash(false)
        setSelT(null)
        setSelH(null)
      }, 450)
    }
  }

  function tapTarget(id: string) {
    if (flash || matched.has(id)) return
    setSelT(id)
    if (selH) attempt(id, selH)
  }
  function tapMeaning(id: string) {
    if (flash || matched.has(id)) return
    setSelH(id)
    if (selT) attempt(selT, id)
  }

  const cls = (id: string, selected: string | null) =>
    `option ${matched.has(id) ? 'matched' : ''} ${selected === id ? (flash ? 'wrong' : 'selected') : ''}`

  return (
    <div className="exercise">
      <h2 className="title">התאימו בין הזוגות</h2>
      <div className="match">
        <div className="match-col">
          {targets.map((w) => (
            <button key={w.id} className={cls(w.id, selT)} onClick={() => tapTarget(w.id)}>
              <Txt lang={lang}>{w.target}</Txt>
            </button>
          ))}
        </div>
        <div className="match-col">
          {meanings.map((w) => (
            <button key={w.id} className={cls(w.id, selH)} onClick={() => tapMeaning(w.id)}>
              <Txt lang="he">{w.he}</Txt>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
