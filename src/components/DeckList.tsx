import { langInfo } from '../data/courses'
import { masteredCount } from '../engine/mastery'
import type { Deck, DeckProgress } from '../store/decks'
import { Countdown } from './Countdown'

interface Props {
  decks: Deck[]
  progress: Record<string, DeckProgress>
  onOpen: (id: string) => void
  onNew: () => void
}

export function DeckList({ decks, progress, onOpen, onNew }: Props) {
  return (
    <div className="screen">
      <h1 className="page-title">🎯 הכנה למבחן</h1>
      <p className="muted">
        הקלידו את המילים שיהיו במבחן (באנגלית או בערבית) – המשחק יתרגם אותן לעברית ויבנה שלבים שמכינים אתכם צעד אחר צעד.
      </p>

      {decks.map((deck) => {
        const ids = deck.words.map((w) => w.id)
        const done = masteredCount(ids, progress[deck.id]?.stats ?? {})
        return (
          <button key={deck.id} className="deck-card" onClick={() => onOpen(deck.id)}>
            <div className="deck-card-top">
              <strong>{deck.name}</strong>
              <span>
                {langInfo[deck.lang].flag} {langInfo[deck.lang].he}
              </span>
            </div>
            <div className="mini-progress">
              <div style={{ width: `${(100 * done) / ids.length}%` }} />
            </div>
            <div className="deck-card-bottom">
              <span>
                {done}/{ids.length} מילים נשלטות
              </span>
              <Countdown date={deck.testDate} />
            </div>
          </button>
        )
      })}

      <button className="btn btn-primary new-deck" onClick={onNew}>
        ＋ מבחן חדש
      </button>
    </div>
  )
}
