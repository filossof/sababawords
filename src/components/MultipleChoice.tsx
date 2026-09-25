import { useEffect, useState } from 'react'
import { speak } from '../audio'
import { inLang } from '../data/courses'
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
  // if the device cannot actually speak, show the word so the question stays answerable
  const [silent, setSilent] = useState(false)
  const pickTarget = mode === 'toTarget'

  useEffect(() => {
    if (mode !== 'listen') return
    setSilent(false)
    void speak(word.target, lang).then((r) => setSilent(r !== 'spoken'))
  }, [mode, word.target, lang])

  function pick(id: string) {
    if (picked) return
    setPicked(id)
    if (blind) setTimeout(() => onDone(id === word.id), 350)
    else onDone(id === word.id)
  }

  const title = mode === 'listen' ? 'מה שמעתם?' : pickTarget ? `איך אומרים ${inLang(lang)}?` : 'מה המשמעות?'

  return (
    <div className="exercise">
      <h2 className="title">{title}</h2>
      <div className="prompt">
        {mode === 'listen' && (
          <>
            <Speaker text={word.target} lang={lang} big />
            {silent && (
              <Txt lang={lang} className="big-word">
                {word.target}
              </Txt>
            )}
          </>
        )}
        {mode === 'toHe' && (
          <>
            <Txt lang={lang} className={word.sentence ? 'sentence' : 'big-word'}>
              {word.target}
            </Txt>
            {audio && <Speaker text={word.target} lang={lang} />}
          </>
        )}
        {pickTarget && (
          <div className="prompt-stack">
            {word.pic && <div className="prompt-pic">{word.pic}</div>}
            <Txt lang="he" className={word.sentence ? 'sentence' : 'big-word'}>
              {word.he}
            </Txt>
          </div>
        )}
      </div>
      <div className={`options ${word.sentence ? 'long' : ''}`}>
        {options.map((o) => {
          const state = blind ? (o.id === picked ? 'selected' : '') : picked ? (o.id === word.id ? 'right' : o.id === picked ? 'wrong' : '') : ''
          return (
            <button key={o.id} className={`option ${state}`} disabled={!!picked} data-silent={blind ? undefined : ''} onClick={() => pick(o.id)}>
              {pickTarget ? (
                <>
                  <Txt lang={lang}>{o.target}</Txt>
                  {lang !== 'en' && showTranslit && o.translit && <Txt lang="he" className="translit-sm">{o.translit}</Txt>}
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
