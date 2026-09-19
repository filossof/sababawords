import { useCallback, useEffect, useState } from 'react'
import { applyResults, dayString, type WordStat } from '../engine/mastery'
import { wordId } from '../engine/parse'
import type { Lang, Word } from '../types'
import type { SharedDeck } from './share'

export interface Deck {
  id: string
  name: string
  lang: Lang
  /** YYYY-MM-DD */
  testDate?: string
  words: Word[]
}

export interface MockResult {
  score: number
  total: number
  date: string
  missed: string[]
}

export interface DeckProgress {
  /** words the completed lessons were built from – lessons reset if the word list changes */
  signature: string
  completed: Record<string, number>
  stats: Record<string, WordStat>
  mockBest: number | null
  mockLast: MockResult | null
}

interface State {
  decks: Deck[]
  progress: Record<string, DeckProgress>
}

const KEY = 'sababawords:decks:v1'

const signatureOf = (words: Word[]) => words.map((w) => w.id).join('|')
const emptyProgress = (words: Word[]): DeckProgress => ({
  signature: signatureOf(words),
  completed: {},
  stats: {},
  mockBest: null,
  mockLast: null,
})

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { decks: [], progress: {}, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable or corrupt */
  }
  return { decks: [], progress: {} }
}

export const newDeckId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function deckFromShared(shared: SharedDeck): Deck {
  return {
    id: newDeckId(),
    name: shared.name,
    lang: shared.lang,
    testDate: shared.testDate,
    words: shared.words.map(([target, he]) => ({ id: wordId(target, shared.lang), target, he })),
  }
}

export function useDecks() {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const saveDeck = useCallback((deck: Deck) => {
    setState((s) => {
      const exists = s.decks.some((d) => d.id === deck.id)
      const decks = exists ? s.decks.map((d) => (d.id === deck.id ? deck : d)) : [...s.decks, deck]
      const prev = s.progress[deck.id]
      // changed word list → lessons restart (they were built from the old list); word stats are kept
      const progress =
        prev && prev.signature === signatureOf(deck.words)
          ? prev
          : { ...emptyProgress(deck.words), stats: prev?.stats ?? {} }
      return { decks, progress: { ...s.progress, [deck.id]: progress } }
    })
  }, [])

  const deleteDeck = useCallback((id: string) => {
    setState((s) => {
      const { [id]: _removed, ...progress } = s.progress
      return { decks: s.decks.filter((d) => d.id !== id), progress }
    })
  }, [])

  const completeLesson = useCallback(
    (deckId: string, lessonId: string | null, practiced: string[], missed: string[], accuracy: number) => {
      setState((s) => {
        const prev = s.progress[deckId]
        if (!prev) return s
        const completed = lessonId
          ? { ...prev.completed, [lessonId]: Math.max(accuracy, prev.completed[lessonId] ?? 0) }
          : prev.completed
        return {
          ...s,
          progress: { ...s.progress, [deckId]: { ...prev, completed, stats: applyResults(prev.stats, practiced, missed) } },
        }
      })
    },
    [],
  )

  const recordMock = useCallback((deckId: string, score: number, total: number, missed: string[], allIds: string[]) => {
    setState((s) => {
      const prev = s.progress[deckId]
      if (!prev) return s
      const pct = Math.round((100 * score) / Math.max(total, 1))
      return {
        ...s,
        progress: {
          ...s.progress,
          [deckId]: {
            ...prev,
            stats: applyResults(prev.stats, allIds, missed),
            mockBest: Math.max(pct, prev.mockBest ?? 0),
            mockLast: { score, total, date: dayString(new Date()), missed },
          },
        },
      }
    })
  }, [])

  return { decks: state.decks, progress: state.progress, saveDeck, deleteDeck, completeLesson, recordMock }
}
