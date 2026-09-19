import { useMemo, useState } from 'react'
import { useVoice } from './audio'
import { Home } from './components/Home'
import { LessonPlayer } from './components/LessonPlayer'
import { allLessons, allWords, courses } from './data/courses'
import { generateLesson } from './engine/generate'
import { useProgress } from './store/progress'

export default function App() {
  const { progress, setLang, setShowTranslit, completeLesson } = useProgress()
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const audio = useVoice(progress.lang)

  const course = courses[progress.lang]
  const lesson = lessonId ? allLessons(course).find((l) => l.id === lessonId) : undefined

  // regenerate on each start/retry, but not on every render
  const exercises = useMemo(
    () => (lesson ? generateLesson(lesson.words, allWords(course), { audio, intro: lesson.intro }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson?.id, attempt, progress.lang],
  )

  if (lesson) {
    return (
      <LessonPlayer
        key={`${lesson.id}-${attempt}`}
        lang={progress.lang}
        exercises={exercises}
        showTranslit={progress.showTranslit}
        onExit={() => setLessonId(null)}
        onRetry={() => setAttempt((a) => a + 1)}
        onComplete={(xp, accuracy) => {
          completeLesson(lesson.id, xp, accuracy)
          setLessonId(null)
        }}
      />
    )
  }

  return <Home progress={progress} onLang={setLang} onTranslit={setShowTranslit} onStart={setLessonId} />
}
