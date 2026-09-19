import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Speaker } from './Speaker'
import { Txt } from './Txt'

export function Flashcard({ word, lang, showTranslit, audio, onDone }: ExerciseProps & { word: Word; audio: boolean }) {
  return (
    <div className="exercise">
      <h2 className="title">מילה חדשה</h2>
      <div className="card">
        <Txt lang={lang} className="big-word">
          {word.target}
        </Txt>
        {lang === 'ar' && showTranslit && word.translit && <Txt lang="he" className="translit">{word.translit}</Txt>}
        {audio && <Speaker text={word.target} lang={lang} big />}
        <Txt lang="he" className="meaning">
          {word.he}
        </Txt>
      </div>
      <button className="btn btn-primary" onClick={() => onDone(true)}>
        הבנתי
      </button>
    </div>
  )
}
