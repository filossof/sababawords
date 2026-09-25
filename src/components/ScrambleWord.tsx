import { useMemo, useState } from 'react'
import { shuffle } from '../engine/generate'
import { inLang } from '../data/courses'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { dirOf, Txt } from './Txt'

/** Build the English word by tapping letter tiles in order – gentler than typing. */
export function ScrambleWord({ word, lang, onDone }: ExerciseProps & { word: Word }) {
  const letters = useMemo(() => {
    const chars = [...word.target.toLowerCase()]
    let tiles = shuffle(chars.map((ch, id) => ({ id, ch })))
    // avoid handing over the word already in the right order
    for (let i = 0; i < 5 && tiles.map((t) => t.ch).join('') === word.target.toLowerCase(); i++) tiles = shuffle(tiles)
    return tiles
  }, [word])
  const [placed, setPlaced] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const charOf = (id: number) => letters.find((t) => t.id === id)!.ch
  const built = placed.map(charOf).join('')

  function check() {
    if (done) return
    setDone(true)
    onDone(built === word.target.toLowerCase())
  }

  return (
    <div className="exercise">
      <h2 className="title">סדרו את האותיות {inLang(lang)}</h2>
      <div className="prompt">
        <Txt lang="he" className="big-word">
          {word.he}
        </Txt>
      </div>
      <div className="tiles slots" dir={dirOf(lang)} lang={lang}>
        {placed.length === 0 && <span className="placeholder">…</span>}
        {placed.map((id) => (
          <button key={id} className="tile" disabled={done} onClick={() => setPlaced((p) => p.filter((x) => x !== id))}>
            {charOf(id)}
          </button>
        ))}
      </div>
      <div className="tiles pool" dir={dirOf(lang)} lang={lang}>
        {letters.map((t) => (
          <button
            key={t.id}
            className={`tile ${placed.includes(t.id) ? 'used' : ''}`}
            disabled={done || placed.includes(t.id)}
            onClick={() => setPlaced((p) => [...p, t.id])}
          >
            {t.ch}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" disabled={done || placed.length !== letters.length} onClick={check}>
        בדיקה
      </button>
    </div>
  )
}
