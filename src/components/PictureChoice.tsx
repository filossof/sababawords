import { useState } from 'react'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Speaker } from './Speaker'
import { Txt } from './Txt'

/** See the word, pick the picture that shows what it means. */
export function PictureChoice({ word, options, audio, lang, onDone }: ExerciseProps & { word: Word; options: Word[]; audio: boolean }) {
  const [picked, setPicked] = useState<string | null>(null)

  function pick(id: string) {
    if (picked) return
    setPicked(id)
    onDone(id === word.id)
  }

  return (
    <div className="exercise">
      <h2 className="title">בחרו את התמונה המתאימה</h2>
      <div className="prompt">
        <Txt lang={lang} className="big-word">
          {word.target}
        </Txt>
        {audio && <Speaker text={word.target} lang={lang} />}
      </div>
      <div className="pic-grid">
        {options.map((o) => {
          const state = picked ? (o.id === word.id ? 'right' : o.id === picked ? 'wrong' : '') : ''
          return (
            <button key={o.id} className={`pic-option ${state}`} disabled={!!picked} data-silent="" onClick={() => pick(o.id)} aria-label={o.he}>
              <span className="pic-emoji">{o.pic}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
