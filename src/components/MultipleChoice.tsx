import { useEffect, useState } from 'react'
import { speak } from '../audio'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Speaker } from './Speaker'
import { Txt } from './Txt'

interface Props extends ExerciseProps {
  word: Word
  options: Word[]
  /** toHe: see target → pick Hebrew; toTarget: see Hebrew → pick target; listen: hear target → pick Hebrew */
  mode: 'toHe' | 'toTarget' | 'listen'
  audio: boolean
  /** mock-test mode: no right/wrong colours, just remember the choice and move on */
  blind?: boolean
}

export function MultipleChoice({ word, options, mode, audio, blind, lang, showTranslit, onDone }: Props) {
  const [picked, setPicked] = useState<string | null>(null)
  const pickTarget = mode === 'toTarget'

  useEffect(() => {
    if (mode === 'listen') speak(word.target, lang)
  }, [mode, word.target, lang])

  function pick(id: string) {
    if (picked) return
    setPicked(id)
    if (blind) setTimeout(() => onDone(id === word.id), 350)
    else onDone(id === word.id)
  }

  const langName = lang === 'en' ? 'באנגלית' : 'בערבית'
  const title = mode === 'listen' ? 'מה שמעתם?' : pickTarget ? `איך אומרים ${langName}?` : 'מה המשמעות?'

  return (
    <div className="exercise">
      <h2 className="title">{title}</h2>
      <div className="prompt">
        {mode === 'listen' && <Speaker text={word.target} lang={lang} big />}
        {mode === 'toHe' && (
          <>
            <Txt lang={lang} className="big-word">
              {word.target}
            </Txt>
            {audio && <Speaker text={word.target} lang={lang} />}
          </>
        )}
        {pickTarget && (
          <Txt lang="he" className="big-word">
            {word.he}
          </Txt>
        )}
      </div>
      <div className="options">
        {options.map((o) => {
          const state = blind ? (o.id === picked ? 'selected' : '') : picked ? (o.id === word.id ? 'right' : o.id === picked ? 'wrong' : '') : ''
          return (
            <button key={o.id} className={`option ${state}`} disabled={!!picked} data-silent={blind ? undefined : ''} onClick={() => pick(o.id)}>
              {pickTarget ? (
                <>
                  <Txt lang={lang}>{o.target}</Txt>
                  {lang === 'ar' && showTranslit && o.translit && <Txt lang="he" className="translit-sm">{o.translit}</Txt>}
                </>
              ) : (
                <Txt lang="he">{o.he}</Txt>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
