import { useEffect, useRef, useState } from 'react'
import { useVoice } from '../audio'
import { answerOf } from '../engine/generate'
import { sfx } from '../sound'
import type { Exercise, Lang } from '../types'
import { Flashcard } from './Flashcard'
import { MatchPairs } from './MatchPairs'
import { MultipleChoice } from './MultipleChoice'
import { ScrambleWord } from './ScrambleWord'
import { TypeAnswer } from './TypeAnswer'
import { Txt } from './Txt'

const MAX_HEARTS = 5

interface Props {
  lang: Lang
  exercises: Exercise[]
  showTranslit: boolean
  onExit: () => void
  onRetry: () => void
  /** `missed` = ids of words the learner got wrong at least once */
  onComplete: (xp: number, accuracy: number, missed: string[]) => void
}

export function LessonPlayer({ lang, exercises, showTranslit, onExit, onRetry, onComplete }: Props) {
  const audio = useVoice(lang)
  const [queue, setQueue] = useState<Exercise[]>(exercises)
  const [idx, setIdx] = useState(0)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [mistakes, setMistakes] = useState(0)
  const [missed, setMissed] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null)
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')

  const scored = exercises.filter((e) => e.kind !== 'flashcard').length
  const ex = queue[idx]

  function advance(nextHearts: number) {
    setFeedback(null)
    if (nextHearts <= 0) setStatus('lost')
    else if (idx + 1 >= queue.length) setStatus('won')
    else setIdx(idx + 1)
  }

  function resolve(correct: boolean) {
    let nextHearts = hearts
    if (!correct) {
      nextHearts = hearts - 1
      setHearts(nextHearts)
      setMistakes((m) => m + 1)
      if ('word' in ex) setMissed((m) => new Set(m).add(ex.word.id))
      // missed words come back at the end until answered correctly
      if (ex.kind !== 'match') setQueue((q) => [...q, ex])
    }
    if (ex.kind === 'flashcard' || ex.kind === 'match') advance(nextHearts)
    else {
      if (correct) sfx.correct()
      else sfx.wrong()
      setFeedback({ correct })
    }
  }

  // Enter = continue, once feedback is showing
  const cont = useRef<() => void>(() => {})
  cont.current = () => advance(hearts)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.repeat) cont.current()
    }
    // only active while feedback is on screen
    if (!feedback) return
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [feedback])

  useEffect(() => {
    if (status === 'won') sfx.complete()
    else if (status === 'lost') sfx.fail()
  }, [status])

  if (status !== 'playing') {
    const accuracy = Math.max(0, Math.round((100 * (scored - mistakes)) / Math.max(scored, 1)))
    const xp = status === 'won' ? 10 + (mistakes === 0 ? 5 : 0) : 0
    return (
      <div className="screen center">
        <div className="big-emoji">{status === 'won' ? '🎉' : '💔'}</div>
        <h1>{status === 'won' ? 'סיימתם את השיעור!' : 'נגמרו הלבבות'}</h1>
        {status === 'won' ? (
          <div className="stats">
            <div className="stat">⭐ {xp} XP</div>
            <div className="stat">🎯 {accuracy}% דיוק</div>
          </div>
        ) : (
          <p>לא נורא, נסו שוב – זה מה שמלמד.</p>
        )}
        {status === 'won' ? (
          <button className="btn btn-primary" onClick={() => onComplete(xp, accuracy, [...missed])}>
            המשך
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onRetry}>
              ניסיון נוסף
            </button>
            <button className="btn btn-ghost" onClick={onExit}>
              חזרה
            </button>
          </>
        )}
      </div>
    )
  }

  const answer = feedback && !feedback.correct ? answerOf(ex) : null
  const props = { lang, showTranslit, onDone: resolve }

  return (
    <div className="screen player">
      <header className="player-top">
        <button
          className="icon-btn"
          aria-label="יציאה"
          onClick={() => {
            if (window.confirm('לצאת מהשיעור? ההתקדמות בשיעור תאבד.')) onExit()
          }}
        >
          ✕
        </button>
        <div className="progress" role="progressbar" aria-valuenow={idx} aria-valuemax={queue.length}>
          <div className="progress-fill" style={{ width: `${(100 * idx) / queue.length}%` }} />
        </div>
        <div className="hearts">❤️ {hearts}</div>
      </header>

      <main className="player-body" key={idx}>
        {ex.kind === 'flashcard' && <Flashcard {...props} word={ex.word} audio={audio} />}
        {ex.kind === 'mc' && <MultipleChoice {...props} word={ex.word} options={ex.options} mode={ex.dir} audio={audio} />}
        {ex.kind === 'listen' && <MultipleChoice {...props} word={ex.word} options={ex.options} mode="listen" audio={audio} />}
        {ex.kind === 'match' && <MatchPairs {...props} pairs={ex.pairs} />}
        {ex.kind === 'scramble' && <ScrambleWord {...props} word={ex.word} />}
        {ex.kind === 'type' && <TypeAnswer {...props} word={ex.word} />}
      </main>

      {feedback && (
        <footer className={`feedback ${feedback.correct ? 'ok' : 'bad'}`}>
          <div className="feedback-text">
            <strong>{feedback.correct ? 'כל הכבוד! ✓' : 'לא בדיוק'}</strong>
            {answer && (
              <div>
                התשובה הנכונה: <Txt lang={answer.lang === 'he' ? 'he' : lang}>{answer.text}</Txt>
              </div>
            )}
          </div>
          <button className={`btn ${feedback.correct ? 'btn-primary' : 'btn-danger'}`} onClick={() => advance(hearts)}>
            המשך
          </button>
        </footer>
      )}
    </div>
  )
}
