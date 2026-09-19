import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useVoice } from '../audio'
import { MAX_QUESTIONS } from '../engine/level'
import { answerOf } from '../engine/generate'
import { sfx } from '../sound'
import type { Exercise, Lang } from '../types'
import { Confetti } from './Confetti'
import { Flashcard } from './Flashcard'
import { MatchPairs } from './MatchPairs'
import { Mascot } from './Mascot'
import { MultipleChoice } from './MultipleChoice'
import { PictureChoice } from './PictureChoice'
import { ScrambleWord } from './ScrambleWord'
import { TypeAnswer } from './TypeAnswer'
import { Txt } from './Txt'
import { WordBank } from './WordBank'

const MAX_HEARTS = 5
const CHEERS = ['כל הכבוד!', 'מעולה!', 'יפה מאוד!', 'נהדר!', 'בול!']
const NEARLY = ['לא בדיוק', 'כמעט!', 'לא נורא, ננסה שוב']

export interface Theme {
  color: string
  emoji: string
}

interface Props {
  lang: Lang
  exercises: Exercise[]
  showTranslit: boolean
  theme: Theme
  onExit: () => void
  onRetry: () => void
  /** `missed` = ids of words/sentences the learner got wrong at least once */
  onComplete: (xp: number, accuracy: number, missed: string[]) => void
}

export const starsFor = (accuracy: number) => (accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1)

export function LessonPlayer({ lang, exercises, showTranslit, theme, onExit, onRetry, onComplete }: Props) {
  const audio = useVoice(lang)
  const [queue, setQueue] = useState<Exercise[]>(exercises)
  const [idx, setIdx] = useState(0)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [mistakes, setMistakes] = useState(0)
  const [missed, setMissed] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<{ correct: boolean; line: string } | null>(null)
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [streak, setStreak] = useState(0)

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
      setStreak(0)
      if ('word' in ex) setMissed((m) => new Set(m).add(ex.word.id))
      // missed questions come back at the end – but a level never grows past MAX_QUESTIONS
      if (ex.kind !== 'match' && queue.length < MAX_QUESTIONS) setQueue((q) => [...q, ex])
    } else if (ex.kind !== 'flashcard') setStreak((s) => s + 1)

    if (ex.kind === 'flashcard' || ex.kind === 'match') advance(nextHearts)
    else {
      if (correct) sfx.correct()
      else sfx.wrong()
      const lines = correct ? CHEERS : NEARLY
      setFeedback({ correct, line: lines[Math.floor(Math.random() * lines.length)] })
    }
  }

  // Enter = continue, once feedback is showing
  const cont = useRef<() => void>(() => {})
  cont.current = () => advance(hearts)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.repeat) cont.current()
    }
    if (!feedback) return
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [feedback])

  useEffect(() => {
    if (status === 'won') sfx.complete()
    else if (status === 'lost') sfx.fail()
  }, [status])

  const themeStyle = { '--unit': theme.color } as CSSProperties

  if (status !== 'playing') {
    const accuracy = Math.max(0, Math.round((100 * (scored - mistakes)) / Math.max(scored, 1)))
    const xp = status === 'won' ? 10 + (mistakes === 0 ? 5 : 0) : 0
    const stars = starsFor(accuracy)
    return (
      <div className="screen center result" style={themeStyle}>
        {status === 'won' && <Confetti />}
        <Mascot mood={status === 'won' ? 'cheer' : 'sad'} size={140} className="result-mascot" />
        <h1>{status === 'won' ? 'סיימתם את השלב!' : 'נגמרו הלבבות'}</h1>
        {status === 'won' ? (
          <>
            <div className="stars" aria-label={`${stars} כוכבים`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= stars ? 'star on' : 'star'} style={{ animationDelay: `${0.25 + n * 0.25}s` }}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="stats">
              <div className="stat">⚡ {xp} XP</div>
              <div className="stat">🎯 {accuracy}% דיוק</div>
            </div>
          </>
        ) : (
          <p>לא נורא, נסו שוב – ככה לומדים.</p>
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
  const total = Math.max(queue.length, 1)

  return (
    <div className="screen player" style={themeStyle}>
      <span className="bg-emoji" aria-hidden="true">
        {theme.emoji}
      </span>
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
        <div className="progress" role="progressbar" aria-valuenow={idx} aria-valuemax={total}>
          <div className="progress-fill" style={{ width: `${(100 * idx) / total}%` }} />
        </div>
        <div className="hearts" aria-label={`${hearts} לבבות`}>
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <span key={i} className={i < hearts ? 'heart' : 'heart lost'}>
              {i < hearts ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
      </header>

      {streak >= 3 && !feedback && <div className="combo">🔥 {streak} ברצף!</div>}

      <main className="player-body" key={idx}>
        {ex.kind === 'flashcard' && <Flashcard {...props} word={ex.word} audio={audio} />}
        {ex.kind === 'mc' && <MultipleChoice {...props} word={ex.word} options={ex.options} mode={ex.dir} audio={audio} />}
        {ex.kind === 'listen' && <MultipleChoice {...props} word={ex.word} options={ex.options} mode="listen" audio={audio} />}
        {ex.kind === 'pic' && <PictureChoice {...props} word={ex.word} options={ex.options} audio={audio} />}
        {ex.kind === 'bank' && <WordBank {...props} word={ex.word} dir={ex.dir} tokens={ex.tokens} audio={audio} />}
        {ex.kind === 'match' && <MatchPairs {...props} pairs={ex.pairs} />}
        {ex.kind === 'scramble' && <ScrambleWord {...props} word={ex.word} />}
        {ex.kind === 'type' && <TypeAnswer {...props} word={ex.word} />}
      </main>

      {feedback && (
        <footer className={`feedback ${feedback.correct ? 'ok' : 'bad'}`}>
          <Mascot mood={feedback.correct ? 'cheer' : 'sad'} size={64} />
          <div className="feedback-text">
            <strong>{feedback.correct ? `${feedback.line} ✓` : feedback.line}</strong>
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
