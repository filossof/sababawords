import { useEffect, useRef, useState } from 'react'
import { speak } from '../audio'
import { inLang } from '../data/courses'
import { matchesSpoken } from '../engine/check'
import { listen, type HeardResult } from '../speech'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Speaker } from './Speaker'
import { Txt } from './Txt'

type Phase = 'idle' | 'listening' | 'checking' | 'done'

const TROUBLE: Record<string, string> = {
  'not-allowed': 'אין גישה למיקרופון. אשרו אותה בדפדפן ונסו שוב.',
  'no-speech': 'לא שמענו כלום – הקישו והתחילו לדבר.',
  network: 'הזיהוי דורש חיבור לאינטרנט.',
  unsupported: 'הדפדפן הזה לא תומך בזיהוי דיבור.',
  other: 'משהו השתבש בזיהוי. אפשר לנסות שוב.',
}

interface Props extends ExerciseProps {
  word: Word
  audio: boolean
  /** leave this question without losing a heart (and stop asking for the rest of the lesson) */
  onSkip: () => void
}

/** Say it out loud: the browser listens through the microphone and checks the pronunciation. */
export function Pronounce({ word, lang, showTranslit, audio, onDone, onSkip }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [heard, setHeard] = useState('')
  const [trouble, setTrouble] = useState('')
  const session = useRef<{ stop: () => void } | null>(null)

  useEffect(() => () => session.current?.stop(), [])

  function finish(result: HeardResult) {
    session.current = null
    if (result.error && result.alternatives.length === 0) {
      setPhase('idle')
      setHeard('')
      setTrouble(TROUBLE[result.error] ?? TROUBLE.other)
      return
    }
    const { ok, best } = matchesSpoken(result.alternatives, word.target, lang)
    setHeard(best)
    setPhase('done')
    onDone(ok)
  }

  function start() {
    if (phase === 'listening' || phase === 'checking') {
      session.current?.stop()
      setPhase('checking')
      return
    }
    if (phase === 'done') return
    setTrouble('')
    setHeard('')
    setPhase('listening')
    const s = listen(lang)
    session.current = s
    void s.result.then(finish)
  }

  return (
    <div className="exercise">
      <h2 className="title">אמרו את זה {inLang(lang)}</h2>

      <div className="card speak-card">
        <Txt lang={lang} className={word.sentence ? 'card-sentence' : 'big-word'}>
          {word.target}
        </Txt>
        {lang !== 'en' && showTranslit && word.translit && (
          <Txt lang="he" className="translit">
            {word.translit}
          </Txt>
        )}
        {audio && <Speaker text={word.target} lang={lang} />}
        <Txt lang="he" className="meaning">
          {word.he}
        </Txt>
      </div>

      <button
        className={`mic ${phase}`}
        onClick={start}
        disabled={phase === 'checking' || phase === 'done'}
        data-silent=""
        aria-label={phase === 'listening' ? 'סיום הקלטה' : 'הקלטה'}
      >
        <span className="mic-icon">🎤</span>
        <span className="mic-label">
          {phase === 'idle' && 'הקישו ודברו'}
          {phase === 'listening' && 'מקשיבים… הקישו לסיום'}
          {phase === 'checking' && 'בודקים…'}
          {phase === 'done' && 'סיימתם'}
        </span>
      </button>

      {heard && (
        <div className="heard">
          שמענו: <Txt lang={lang}>{heard}</Txt>
        </div>
      )}
      {trouble && <div className="review-note">{trouble}</div>}

      <div className="speak-extra">
        <button className="link-btn" onClick={() => speak(word.target, lang)}>
          🔊 השמיעו לי שוב
        </button>
        <button className="link-btn" onClick={onSkip}>
          אי אפשר לדבר עכשיו – דלגו
        </button>
      </div>
    </div>
  )
}
