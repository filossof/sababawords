import { useMemo, useState } from 'react'
import { langInfo } from '../data/courses'
import { masteredCount, weakWordIds } from '../engine/mastery'
import { buildLevels, type PrepLesson } from '../engine/testprep'
import { shareUrl } from '../store/share'
import type { Deck, DeckProgress } from '../store/decks'
import { Countdown } from './Countdown'

interface Props {
  deck: Deck
  progress: DeckProgress
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onStartLesson: (lesson: PrepLesson) => void
  onPractice: (wordIds: string[]) => void
  onMock: () => void
}

export function DeckHome({ deck, progress, onBack, onEdit, onDelete, onStartLesson, onPractice, onMock }: Props) {
  const levels = useMemo(() => buildLevels(deck.words, deck.lang), [deck.words, deck.lang])
  const ids = useMemo(() => deck.words.map((w) => w.id), [deck.words])
  const weak = weakWordIds(ids, progress.stats)
  const mastered = masteredCount(ids, progress.stats)
  const [shareMsg, setShareMsg] = useState('')
  const [manualLink, setManualLink] = useState('')

  const lessons = levels.flatMap((l) => l.lessons)
  const firstOpen = lessons.find((l) => !(l.id in progress.completed))?.id

  async function share() {
    const url = await shareUrl({
      name: deck.name,
      lang: deck.lang,
      testDate: deck.testDate,
      words: deck.words.map((w) => [w.target, w.he]),
    })
    try {
      if (navigator.share) {
        await navigator.share({ title: `SababaWords – ${deck.name}`, url })
        return
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return // share sheet dismissed
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMsg('הקישור הועתק – שלחו אותו לטלפון או לחבר')
      setManualLink('')
    } catch {
      setShareMsg('לא הצלחנו להעתיק אוטומטית – העתיקו את הקישור:')
      setManualLink(url)
    }
  }

  return (
    <div className="screen home">
      <header className="editor-top">
        <button className="icon-btn" aria-label="חזרה" onClick={onBack}>
          →
        </button>
        <h1 className="page-title">{deck.name}</h1>
      </header>

      <div className="deck-summary">
        <div className="deck-card-top">
          <span>
            {langInfo[deck.lang].flag} {langInfo[deck.lang].he} · {deck.words.length} מילים
          </span>
          <Countdown date={deck.testDate} />
        </div>
        <div className="mini-progress">
          <div style={{ width: `${(100 * mastered) / deck.words.length}%` }} />
        </div>
        <div className="muted">
          {mastered}/{deck.words.length} מילים נשלטות
          {progress.mockBest !== null && ` · מבחן דמה – שיא ${progress.mockBest}%`}
        </div>
      </div>

      <div className="deck-actions">
        {weak.length > 0 && (
          <button className="btn btn-blue" onClick={() => onPractice(weak)}>
            💪 תרגול מילים חלשות ({weak.length})
          </button>
        )}
        <button className="btn btn-ghost small" onClick={() => void share()}>
          🔗 שיתוף
        </button>
        <button className="btn btn-ghost small" onClick={onEdit}>
          ✏️ עריכה
        </button>
        <button
          className="btn btn-ghost small"
          onClick={() => window.confirm(`למחוק את "${deck.name}"?`) && onDelete()}
        >
          🗑 מחיקה
        </button>
      </div>
      {shareMsg && <div className="parse-summary ok">{shareMsg}</div>}
      {manualLink && <input className="link-box" readOnly value={manualLink} dir="ltr" onFocus={(e) => e.target.select()} />}

      {levels.map((level) => (
        <section key={level.id} className="unit">
          <h2 className="unit-title">
            <span>{level.emoji}</span> {level.title}
            <small>{level.blurb}</small>
          </h2>
          <div className="path">
            {level.lessons.map((lesson, i) => {
              const done = lesson.id in progress.completed
              const current = lesson.id === firstOpen
              const locked = !done && !current
              return (
                <button
                  key={lesson.id}
                  className={`node ${done ? 'done' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''}`}
                  style={{ marginInlineStart: `${[0, 44, 16][i % 3]}px` }}
                  disabled={locked}
                  onClick={() => onStartLesson(lesson)}
                  aria-label={`${level.title} – ${lesson.title}`}
                >
                  {done ? '✓' : locked ? '🔒' : '★'}
                  <small>{lesson.title}</small>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <section className="unit">
        <h2 className="unit-title mock-title">
          <span>📝</span> 5. מבחן דמה
          <small>כל המילים, בלי רמזים, עם ציון בסוף – פתוח תמיד</small>
        </h2>
        <div className="path">
          <button
            className="node mock"
            onClick={onMock}
            aria-label="מבחן דמה"
          >
            📝<small>{progress.mockLast ? `${Math.round((100 * progress.mockLast.score) / progress.mockLast.total)}%` : 'התחלה'}</small>
          </button>
        </div>
      </section>
    </div>
  )
}
