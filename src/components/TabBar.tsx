export type Tab = 'learn' | 'decks' | 'settings'

const TABS: [Tab, string, string][] = [
  ['learn', '📚', 'לימוד'],
  ['decks', '🎯', 'הכנה למבחן'],
  ['settings', '⚙️', 'הגדרות'],
]

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      {TABS.map(([id, icon, label]) => (
        <button key={id} className={tab === id ? 'active' : ''} onClick={() => onTab(id)}>
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  )
}
