export type Tab = 'learn' | 'decks'

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      <button className={tab === 'learn' ? 'active' : ''} onClick={() => onTab('learn')}>
        <span>📚</span>
        לימוד
      </button>
      <button className={tab === 'decks' ? 'active' : ''} onClick={() => onTab('decks')}>
        <span>🎯</span>
        הכנה למבחן
      </button>
    </nav>
  )
}
