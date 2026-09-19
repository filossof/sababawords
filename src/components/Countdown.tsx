export function daysUntil(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  const target = new Date(y, m - 1, d).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((target - today) / 86_400_000)
}

export function Countdown({ date }: { date?: string }) {
  if (!date) return null
  const days = daysUntil(date)
  const text = days > 1 ? `עוד ${days} ימים למבחן` : days === 1 ? 'המבחן מחר!' : days === 0 ? 'המבחן היום! בהצלחה 🍀' : 'המבחן כבר עבר'
  return <span className={`countdown ${days >= 0 && days <= 2 ? 'soon' : ''}`}>📅 {text}</span>
}
