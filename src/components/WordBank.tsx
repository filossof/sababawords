import { useEffect, useMemo, useState } from 'react'
import { speak } from '../audio'
import { toLang } from '../data/courses'
import { sameSentence } from '../engine/check'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Speaker } from './Speaker'
import { dirOf, Txt } from './Txt'

interface Props extends ExerciseProps {
  word: Word
  dir: 'toTarget' | 'toHe' | 'listen'
  tokens: string[]
  audio: boolean
}

/** Build a sentence by tapping word tiles in order (like Duolingo's word bank). */
export function WordBank({ word, dir, tokens, audio, lang, onDone }: Props) {
  const [placed, setPlaced] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const answerLang = dir === 'toHe' ? 'he' : lang
  const answer = dir === 'toHe' ? word.he : word.target
  const rtl = dirOf(answerLang) === 'rtl'
  const built = useMemo(() => placed.map((i) => tokens[i]).join(' '), [placed, tokens])

  // if the device cannot actually speak, show the sentence so the question stays answerable
  const [silent, setSilent] = useState(false)
  useEffect(() => {
    if (dir !== 'listen') return
    setSilent(false)
    void speak(word.target, lang).then((r) => setSilent(r !== 'spoken'))
  }, [dir, word.target, lang])

  function check() {
    if (done || placed.length === 0) return
    setDone(true)
    onDone(sameSentence(built, answer, answerLang))
  }

  const title =
    dir === 'listen' ? 'הקשיבו וכתבו את המשפט' : dir === 'toHe' ? 'תרגמו לעברית' : `תרגמו ${toLang(lang)}`

  return (
    <div className="exercise">
      <h2 className="title">{title}</h2>
      <div className="sentence-prompt">
        {dir === 'listen' && (
          <>
            <Speaker text={word.target} lang={lang} big />
            {silent && (
              <Txt lang={lang} className="sentence">
                {word.target}
              </Txt>
            )}
          </>
        )}
        {dir === 'toHe' && (
          <>
            {audio && <Speaker text={word.target} lang={lang} />}
            <Txt lang={lang} className="sentence">
              {word.target}
            </Txt>
          </>
        )}
        {dir === 'toTarget' && (
          <Txt lang="he" className="sentence">
            {word.he}
          </Txt>
        )}
      </div>

      <div className="answer-slots" dir={rtl ? 'rtl' : 'ltr'} lang={answerLang}>
        {placed.length === 0 && <span className="placeholder">הקישו על המילים לפי הסדר</span>}
        {placed.map((i) => (
          <button key={i} className="chip-token" disabled={done} onClick={() => setPlaced((p) => p.filter((x) => x !== i))}>
            {tokens[i]}
          </button>
        ))}
      </div>

      <div className="token-pool" dir={rtl ? 'rtl' : 'ltr'} lang={answerLang}>
        {tokens.map((t, i) => (
          <button
            key={i}
            className={`chip-token ${placed.includes(i) ? 'used' : ''}`}
            disabled={done || placed.includes(i)}
            onClick={() => setPlaced((p) => [...p, i])}
          >
            {t}
          </button>
        ))}
      </div>

      <button className="btn btn-primary" disabled={done || placed.length === 0} onClick={check}>
        בדיקה
      </button>
    </div>
  )
}
