import { useEffect, useRef, useState } from 'react'
import { sfx } from '../sound'
import type { Deck } from '../store/decks'
import type { Exercise } from '../types'
import { MultipleChoice } from './MultipleChoice'
import { TypeAnswer } from './TypeAnswer'
import { Txt } from './Txt'

interface Props {
  deck: Deck
  questions: Exercise[]
  onFinish: (score: number, total: number, missed: string[]) => void
  onPractice: (missedIds: string[]) => void
  onExit: () => void
}

/** A test simulation: no hints, no right/wrong feedback until the end. */
export function MockTest({ deck, questions, onFinish, onPractice, onExit }: Props) {
  const [idx, setIdx] = useState(0)
  const [missed, setMissed] = useState<string[]>([])
  const finished = idx >= questions.length
  const reported = useRef(false)

  useEffect(() => {
    if (!finished || reported.current) return
    reported.current = true
    sfx.complete()
    onFinish(questions.length - missed.length, questions.length, missed)
  }, [finished, questions.length, missed, onFinish])

  function answer(correct: boolean) {
    const q = questions[idx]
    if (!correct && 'word' in q) setMissed((m) => [...m, q.word.id])
    setIdx((i) => i + 1)
  }

  if (finished) {
    const total = questions.length
    const score = total - missed.length
    const pct = Math.round((100 * score) / total)
    const wrongWords = missed.map((id) => deck.words.find((w) => w.id === id)!).filter(Boolean)
    return (
      <div className="screen">
        <div className="center-block">
          <div className="big-emoji">{pct >= 90 ? '🏆' : pct >= 70 ? '👏' : '💪'}</div>
          <h1>
            {score}/{total} · {pct}%
          </h1>
          <p className="muted">
            {pct >= 90 ? 'מעולה! אתם מוכנים למבחן.' : pct >= 70 ? 'יפה מאוד – עוד קצת תרגול והכול יושב.' : 'יש עוד מה לתרגל – זה בדיוק בשביל זה.'}
          </p>
        </div>

        {wrongWords.length > 0 && (
          <>
            <h2 className="section-title">מילים לחזרה</h2>
            <ul className="missed-list">
              {wrongWords.map((w) => (
                <li key={w.id}>
                  <Txt lang={deck.lang}>{w.target}</Txt>
                  <span>←</span>
                  <Txt lang="he">{w.he}</Txt>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={() => onPractice(missed)}>
              תרגלו את המילים האלה
            </button>
          </>
        )}
        <button className="btn btn-ghost" onClick={onExit}>
          חזרה
        </button>
      </div>
    )
  }

  const q = questions[idx]
  const props = { lang: deck.lang, showTranslit: false, onDone: answer }
  return (
    <div className="screen player">
      <header className="player-top">
        <button
          className="icon-btn"
          aria-label="יציאה"
          onClick={() => window.confirm('לצאת מהמבחן? התוצאה לא תישמר.') && onExit()}
        >
          ✕
        </button>
        <div className="progress" role="progressbar" aria-valuenow={idx} aria-valuemax={questions.length}>
          <div className="progress-fill" style={{ width: `${(100 * idx) / questions.length}%` }} />
        </div>
        <div className="hearts">
          {idx + 1}/{questions.length}
        </div>
      </header>
      <main className="player-body" key={idx}>
        {q.kind === 'mc' && <MultipleChoice {...props} word={q.word} options={q.options} mode={q.dir} audio={false} blind />}
        {q.kind === 'type' && <TypeAnswer {...props} word={q.word} />}
      </main>
    </div>
  )
}
