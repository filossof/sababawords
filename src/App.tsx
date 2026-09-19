import { useEffect, useState } from 'react'
import { setVoicePreferences, useVoice } from './audio'
import { DeckEditor } from './components/DeckEditor'
import { DeckHome } from './components/DeckHome'
import { DeckList } from './components/DeckList'
import { Home } from './components/Home'
import { LessonPlayer } from './components/LessonPlayer'
import { MockTest } from './components/MockTest'
import { Settings } from './components/Settings'
import { TabBar, type Tab } from './components/TabBar'
import { allLessons, courses, langInfo } from './data/courses'
import { generateLevel } from './engine/level'
import { generateMock, generatePrepLesson, type PrepLesson } from './engine/testprep'
import type { PlaySession } from './session'
import { installClickSounds, setSoundEnabled, sfx } from './sound'
import { deckFromShared, useDecks, type Deck } from './store/decks'
import { HASH_PREFIX, decodeDeck } from './store/share'
import { useProgress } from './store/progress'
import type { Exercise } from './types'

const PREP_THEME = { color: '#1cb0f6', emoji: '🎯' }

type View =
  | { name: Tab }
  | { name: 'edit'; deckId?: string }
  | { name: 'deck'; deckId: string }
  | { name: 'mock'; deckId: string; questions: Exercise[] }

export default function App() {
  const { progress, setLang, setShowTranslit, setSoundOn, setVoice, earnXp } = useProgress()
  const store = useDecks()
  const [view, setView] = useState<View>({ name: 'learn' })
  const [session, setSession] = useState<{ def: PlaySession; exercises: Exercise[]; attempt: number } | null>(null)
  const [incoming, setIncoming] = useState<Deck | null>(null)
  const audio = useVoice(progress.lang)

  useEffect(installClickSounds, [])
  useEffect(() => setSoundEnabled(progress.soundOn), [progress.soundOn])
  useEffect(() => setVoicePreferences(progress.voices), [progress.voices])

  // a shared deck arrives as a link like …/sababawords/#deck=<code>
  useEffect(() => {
    if (!location.hash.startsWith(HASH_PREFIX)) return
    const code = location.hash.slice(HASH_PREFIX.length)
    history.replaceState(null, '', location.pathname + location.search)
    void decodeDeck(code).then((shared) => {
      if (shared) setIncoming(deckFromShared(shared))
    })
  }, [])

  const course = courses[progress.lang]
  const play = (def: PlaySession) => setSession({ def, exercises: def.make(), attempt: 0 })

  function startLesson(lessonId: string) {
    const lesson = allLessons(course).find((l) => l.id === lessonId)
    if (!lesson) return
    play({
      lang: progress.lang,
      theme: { color: lesson.unit.color, emoji: lesson.unit.emoji },
      make: () => generateLevel(lesson, { lang: progress.lang, audio }),
      onComplete: (xp, accuracy) => earnXp(xp, lesson.id, accuracy),
    })
  }

  // ---- test prep ----
  const deckOf = (id: string) => store.decks.find((d) => d.id === id)

  function finishDeckLesson(deck: Deck, lessonId: string | null, practiced: string[], missed: string[], accuracy: number, xp: number) {
    store.completeLesson(deck.id, lessonId, practiced, missed, accuracy)
    earnXp(xp)
  }

  function startPrepLesson(deck: Deck, lesson: PrepLesson) {
    play({
      lang: deck.lang,
      make: () => generatePrepLesson(lesson.kind, lesson.words, deck.words, { lang: deck.lang, audio }),
      onComplete: (xp, accuracy, missed) =>
        finishDeckLesson(deck, lesson.id, lesson.words.map((w) => w.id), missed, accuracy, xp),
    })
  }

  function practiceWords(deck: Deck, wordIds: string[]) {
    const words = wordIds
      .slice(0, 4)
      .map((id) => deck.words.find((w) => w.id === id))
      .filter((w) => w !== undefined)
    play({
      lang: deck.lang,
      make: () => generatePrepLesson('weak', words, deck.words, { lang: deck.lang, audio }),
      onComplete: (xp, accuracy, missed) => finishDeckLesson(deck, null, words.map((w) => w.id), missed, accuracy, xp),
    })
  }

  // ---- screens ----
  if (session) {
    return (
      <LessonPlayer
        key={session.attempt}
        lang={session.def.lang}
        theme={session.def.theme ?? PREP_THEME}
        exercises={session.exercises}
        showTranslit={progress.showTranslit}
        onExit={() => setSession(null)}
        onRetry={() => setSession({ ...session, exercises: session.def.make(), attempt: session.attempt + 1 })}
        onComplete={(xp, accuracy, missed) => {
          session.def.onComplete(xp, accuracy, missed)
          setSession(null)
        }}
      />
    )
  }

  if (incoming) {
    const lang = langInfo[incoming.lang].he
    return (
      <div className="screen center">
        <div className="big-emoji">📥</div>
        <h1>קיבלתם רשימת מילים</h1>
        <p>
          <strong>{incoming.name}</strong> · {lang} · {incoming.words.length} מילים
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            store.saveDeck(incoming)
            setView({ name: 'deck', deckId: incoming.id })
            setIncoming(null)
          }}
        >
          הוספה והתחלה
        </button>
        <button className="btn btn-ghost" onClick={() => setIncoming(null)}>
          לא עכשיו
        </button>
      </div>
    )
  }

  const tab: Tab = view.name === 'learn' ? 'learn' : view.name === 'settings' ? 'settings' : 'decks'
  const withTabs = (screen: React.ReactNode) => (
    <div className="with-tabbar">
      {screen}
      <TabBar tab={tab} onTab={(t) => setView({ name: t })} />
    </div>
  )

  function toggleSound(on: boolean) {
    setSoundOn(on)
    setSoundEnabled(on)
    if (on) sfx.correct() // audible confirmation that sound works
  }

  const decksScreen = () =>
    withTabs(
      <DeckList
        decks={store.decks}
        progress={store.progress}
        onOpen={(deckId) => setView({ name: 'deck', deckId })}
        onNew={() => setView({ name: 'edit' })}
      />,
    )

  switch (view.name) {
    case 'learn':
      return withTabs(
        <Home progress={progress} onLang={setLang} onSound={toggleSound} onStart={startLesson} />,
      )

    case 'settings':
      return withTabs(
        <Settings progress={progress} onSound={toggleSound} onVoice={setVoice} onTranslit={setShowTranslit} />,
      )

    case 'decks':
      return decksScreen()

    case 'edit': {
      const existing = view.deckId ? deckOf(view.deckId) : undefined
      return (
        <DeckEditor
          existing={existing}
          onCancel={() => setView(existing ? { name: 'deck', deckId: existing.id } : { name: 'decks' })}
          onSave={(deck) => {
            store.saveDeck(deck)
            setView({ name: 'deck', deckId: deck.id })
          }}
        />
      )
    }

    case 'deck': {
      const deck = deckOf(view.deckId)
      const prog = store.progress[view.deckId]
      if (!deck || !prog) return decksScreen()
      return withTabs(
        <DeckHome
          deck={deck}
          progress={prog}
          onBack={() => setView({ name: 'decks' })}
          onEdit={() => setView({ name: 'edit', deckId: deck.id })}
          onDelete={() => {
            store.deleteDeck(deck.id)
            setView({ name: 'decks' })
          }}
          onStartLesson={(lesson) => startPrepLesson(deck, lesson)}
          onPractice={(ids) => practiceWords(deck, ids)}
          onMock={() =>
            setView({ name: 'mock', deckId: deck.id, questions: generateMock(deck.words, deck.words, deck.lang) })
          }
        />,
      )
    }

    case 'mock': {
      const deck = deckOf(view.deckId)
      if (!deck) return null
      const back = () => setView({ name: 'deck', deckId: deck.id })
      return (
        <MockTest
          deck={deck}
          questions={view.questions}
          onExit={back}
          onPractice={(ids) => {
            back()
            practiceWords(deck, ids)
          }}
          onFinish={(score, total, missed) => {
            store.recordMock(deck.id, score, total, missed, deck.words.map((w) => w.id))
            earnXp(score === total ? 20 : 10)
          }}
        />
      )
    }
  }
}
