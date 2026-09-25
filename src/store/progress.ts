import { useCallback, useEffect, useState } from 'react'
import type { Lang } from '../types'

export interface Progress {
  lang: Lang
  xp: number
  streak: number
  lastDay: string | null
  /** lessonId -> best accuracy (0-100) */
  completed: Record<string, number>
  showTranslit: boolean
  soundOn: boolean
  /** chosen text-to-speech voice per language (by name); missing = automatic */
  voices: Partial<Record<Lang, string>>
}

const KEY = 'sababawords:v1'

const initial: Progress = {
  lang: 'en',
  xp: 0,
  streak: 0,
  lastDay: null,
  completed: {},
  showTranslit: true,
  soundOn: true,
  voices: {},
}

const dayString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable or corrupt – start fresh */
  }
  return initial
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      /* ignore */
    }
  }, [progress])

  /** Clears everything the learner earned (levels, XP, streak) but keeps their preferences. */
  const resetLearning = useCallback(
    () =>
      setProgress((p) => ({ ...initial, lang: p.lang, showTranslit: p.showTranslit, soundOn: p.soundOn, voices: p.voices })),
    [],
  )

  const setLang = useCallback((lang: Lang) => setProgress((p) => ({ ...p, lang })), [])
  const setShowTranslit = useCallback(
    (showTranslit: boolean) => setProgress((p) => ({ ...p, showTranslit })),
    [],
  )

  const setVoice = useCallback(
    (lang: Lang, name: string) =>
      setProgress((p) => ({ ...p, voices: { ...p.voices, [lang]: name || undefined } })),
    [],
  )

  const setSoundOn = useCallback((soundOn: boolean) => setProgress((p) => ({ ...p, soundOn })), [])

  /** Adds XP and keeps the day streak going. */
  const earnXp = useCallback((xp: number, lessonId?: string, accuracy = 0) => {
    setProgress((p) => {
      const now = new Date()
      const today = dayString(now)
      const yesterday = dayString(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
      let streak = p.streak
      if (p.lastDay !== today) streak = p.lastDay === yesterday ? p.streak + 1 : 1
      const completed = lessonId
        ? { ...p.completed, [lessonId]: Math.max(accuracy, p.completed[lessonId] ?? 0) }
        : p.completed
      return { ...p, xp: p.xp + xp, streak, lastDay: today, completed }
    })
  }, [])

  return { progress, setLang, setShowTranslit, setSoundOn, setVoice, earnXp, resetLearning }
}
