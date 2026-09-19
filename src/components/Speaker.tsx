import { speak } from '../audio'
import type { Lang } from '../types'

export function Speaker({ text, lang, big }: { text: string; lang: Lang; big?: boolean }) {
  return (
    <button
      type="button"
      className={big ? 'speaker speaker-big' : 'speaker'}
      aria-label="השמעה"
      onClick={() => speak(text, lang)}
    >
      🔊
    </button>
  )
}
