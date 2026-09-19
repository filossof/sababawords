import { useState, type CSSProperties } from 'react'
import { speak, useVoiceList } from '../audio'
import { allLessons, courses, langInfo, LEVELS_PER_UNIT, unitLevels } from '../data/courses'
import { testSound } from '../sound'
import type { Progress } from '../store/progress'
import type { Lang } from '../types'
import { Mascot } from './Mascot'
import { starsFor } from './LessonPlayer'

interface Props {
  progress: Progress
  onLang: (l: Lang) => void
  onTranslit: (v: boolean) => void
  onSound: (on: boolean) => void
  onVoice: (lang: Lang, name: string) => void
  onStart: (lessonId: string) => void
}

/** Layout of the winding trail: node centres are offset from the middle by these many px. */
const TRAIL_OFFSETS = [0, 52, 80, 52, 0, -52, -80, -52]
const STEP = 104
const TRAIL_WIDTH = 280

function trailPath(): string {
  const pts = TRAIL_OFFSETS.map((dx, i) => [TRAIL_WIDTH / 2 + dx, 40 + i * STEP])
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`
      const [px, py] = pts[i - 1]
      return `C${px} ${py + STEP / 2} ${x} ${y - STEP / 2} ${x} ${y}`
    })
    .join(' ')
}
const PATH = trailPath()

export function Home({ progress, onLang, onTranslit, onSound, onVoice, onStart }: Props) {
  const course = courses[progress.lang]
  const order = allLessons(course).map((l) => l.id)
  const firstOpen = order.find((id) => !(id in progress.completed))
  const voices = useVoiceList(progress.lang)
  const [soundCheck, setSoundCheck] = useState('')

  return (
    <div className="screen home">
      <header className="home-top">
        <div className="langs">
          {(Object.keys(langInfo) as Lang[]).map((l) => (
            <button key={l} className={`pill ${l === progress.lang ? 'active' : ''}`} onClick={() => onLang(l)}>
              {langInfo[l].flag} {langInfo[l].native}
            </button>
          ))}
        </div>
        <div className="scores">
          <span className="chip-stat flame" title="רצף ימים">
            🔥 {progress.streak}
          </span>
          <span className="chip-stat" title="נקודות ניסיון">
            ⚡ {progress.xp}
          </span>
          <button
            className="icon-btn"
            aria-label={progress.soundOn ? 'השתקת צלילים' : 'הפעלת צלילים'}
            onClick={() => onSound(!progress.soundOn)}
          >
            {progress.soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      <details className="settings">
        <summary>⚙️ הגדרות צליל וקול</summary>
        <div className="settings-body">
          <div>
            <button
              className="link-btn"
              onClick={() =>
                void testSound().then((ok) =>
                  setSoundCheck(ok ? 'הצליל נוגן. לא שמעתם? העלו את עוצמת המדיה בטלפון ובדקו שהאוזניות לא מחוברות.' : 'הדפדפן חסם את הצליל – הקישו שוב.'),
                )
              }
            >
              🔔 בדיקת צליל
            </button>{' '}
            <span className="muted">{soundCheck}</span>
          </div>

          <label className="voice-row">
            <span>
              קול ההקראה ({langInfo[progress.lang].he}):
            </span>
            <select
              value={progress.voices[progress.lang] ?? ''}
              onChange={(e) => onVoice(progress.lang, e.target.value)}
              aria-label="קול ההקראה"
            >
              <option value="">אוטומטי (מומלץ)</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <button
              className="link-btn"
              onClick={() => speak(progress.lang === 'en' ? 'white, wait, weight' : 'مرحبا', progress.lang)}
            >
              ▶ נסו את הקול
            </button>
          </label>

          {progress.lang === 'ar' && (
            <label className="toggle">
              <input type="checkbox" checked={progress.showTranslit} onChange={(e) => onTranslit(e.target.checked)} />
              הצגת תעתיק באותיות עבריות
            </label>
          )}
        </div>
      </details>

      {course.units.map((unit, ui) => {
        const levels = unitLevels(course, unit)
        const done = levels.filter((l) => l.id in progress.completed).length
        const complete = done === LEVELS_PER_UNIT
        const started = done > 0 || levels.some((l) => l.id === firstOpen)
        const style = { '--unit': unit.color } as CSSProperties
        return (
          <section key={unit.id} className={`unit-card ${complete ? 'complete' : ''} ${started ? '' : 'far'}`} style={style}>
            <div className="unit-banner" data-emoji={unit.emoji.repeat(7)}>
              <div className="unit-emoji" aria-hidden="true">
                {unit.emoji}
              </div>
              <div className="unit-info">
                <small>יחידה {ui + 1}</small>
                <h2>{unit.title}</h2>
                <div className="unit-progress" aria-label={`${done} מתוך ${LEVELS_PER_UNIT}`}>
                  <div style={{ width: `${(100 * done) / LEVELS_PER_UNIT}%` }} />
                </div>
              </div>
              <div className="unit-count">
                {done}/{LEVELS_PER_UNIT}
              </div>
            </div>

            <div className="trail" style={{ width: TRAIL_WIDTH, height: 40 + LEVELS_PER_UNIT * STEP + 30 }}>
              <svg className="trail-line" width={TRAIL_WIDTH} height={40 + LEVELS_PER_UNIT * STEP} aria-hidden="true">
                <path d={PATH} />
              </svg>

              {/* little scenery along the trail */}
              {[1, 3, 5, 7].map((row, k) => (
                <span
                  key={row}
                  className="scenery"
                  style={{ top: 40 + row * STEP - 30, [k % 2 ? 'left' : 'right']: -6 } as CSSProperties}
                  aria-hidden="true"
                >
                  {unit.emoji}
                </span>
              ))}

              {levels.map((lesson, i) => {
                const isDone = lesson.id in progress.completed
                const current = lesson.id === firstOpen
                const locked = !isDone && !current
                const stars = isDone ? starsFor(progress.completed[lesson.id]) : 0
                const cx = TRAIL_WIDTH / 2 + TRAIL_OFFSETS[i]
                return (
                  <div key={lesson.id} className="trail-step" style={{ left: cx - 38, top: 40 + i * STEP - 38 }}>
                    {current && (
                      <>
                        <div className="start-bubble">התחילו!</div>
                        <Mascot mood="wave" size={70} className={`trail-mascot ${TRAIL_OFFSETS[i] > 0 ? 'left' : 'right'}`} />
                      </>
                    )}
                    <button
                      className={`lvl ${isDone ? 'done' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''} ${lesson.kind === 'challenge' ? 'boss' : ''}`}
                      disabled={locked}
                      onClick={() => onStart(lesson.id)}
                      aria-label={`${unit.title} – ${lesson.title}`}
                    >
                      <span className="lvl-icon">{locked ? '🔒' : lesson.icon}</span>
                      {isDone && <span className="lvl-check">✓</span>}
                    </button>
                    <div className="lvl-label">{lesson.title}</div>
                    {isDone && (
                      <div className="lvl-stars" aria-hidden="true">
                        {'⭐'.repeat(stars)}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className={`trophy ${complete ? 'won' : ''}`} style={{ left: TRAIL_WIDTH / 2 - 30, top: 40 + LEVELS_PER_UNIT * STEP - 30 }}>
                {complete ? '👑' : '🎁'}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
