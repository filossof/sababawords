import type { CSSProperties } from 'react'
import { allLessons, courses, langInfo, LANGS, LEVELS_PER_UNIT, unitLevels } from '../data/courses'
import type { Progress } from '../store/progress'
import type { Lang } from '../types'
import { Mascot } from './Mascot'
import { starsFor } from './LessonPlayer'

interface Props {
  progress: Progress
  onLang: (l: Lang) => void
  onSound: (on: boolean) => void
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

export function Home({ progress, onLang, onSound, onStart }: Props) {
  const course = courses[progress.lang]
  const order = allLessons(course).map((l) => l.id)
  const firstOpen = order.find((id) => !(id in progress.completed))

  return (
    <div className="screen home">
      <header className="home-top">
        <label className="lang-select">
          <span className="sr-only">שפת הלימוד</span>
          <select value={progress.lang} onChange={(e) => onLang(e.target.value as Lang)} aria-label="שפת הלימוד">
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {langInfo[l].flag} {langInfo[l].native}
              </option>
            ))}
          </select>
        </label>
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
