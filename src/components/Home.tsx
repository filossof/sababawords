import { allLessons, courses, langInfo, unitLessons } from '../data/courses'
import type { Progress } from '../store/progress'
import type { Lang } from '../types'

interface Props {
  progress: Progress
  onLang: (l: Lang) => void
  onTranslit: (v: boolean) => void
  onStart: (lessonId: string) => void
}

export function Home({ progress, onLang, onTranslit, onStart }: Props) {
  const course = courses[progress.lang]
  const order = allLessons(course).map((l) => l.id)
  const firstOpen = order.find((id) => !(id in progress.completed))

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
          <span title="רצף ימים">🔥 {progress.streak}</span>
          <span title="נקודות ניסיון">⭐ {progress.xp}</span>
        </div>
      </header>

      {progress.lang === 'ar' && (
        <label className="toggle">
          <input type="checkbox" checked={progress.showTranslit} onChange={(e) => onTranslit(e.target.checked)} />
          הצגת תעתיק באותיות עבריות
        </label>
      )}

      {course.units.map((unit) => (
        <section key={unit.id} className="unit">
          <h2 className="unit-title">
            <span>{unit.emoji}</span> {unit.title}
          </h2>
          <div className="path">
            {unitLessons(unit).map((lesson, i) => {
              const done = lesson.id in progress.completed
              const current = lesson.id === firstOpen
              const locked = !done && !current
              return (
                <button
                  key={lesson.id}
                  className={`node ${done ? 'done' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''}`}
                  style={{ marginInlineStart: `${[0, 44, 16][i]}px` }}
                  disabled={locked}
                  onClick={() => onStart(lesson.id)}
                  aria-label={`${unit.title} – ${lesson.title}`}
                >
                  {done ? '✓' : locked ? '🔒' : '★'}
                  <small>{lesson.title}</small>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
