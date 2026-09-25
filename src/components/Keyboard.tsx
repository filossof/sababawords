import type { Lang } from '../types'

const rows: Record<Lang, string[]> = {
  en: ['qwertyuiop', 'asdfghjkl', "zxcvbnm'-"],
  ar: ['ضصثقفغعهخحجد', 'شسيبلاتنمكط', 'ئءؤرىةوزظ', 'أإآذ'],
  // the Bulgarian alphabet in order – easier to find a letter than a typewriter layout
  bg: ['абвгдежзий', 'клмнопрсту', 'фхцчшщъьюя'],
}

interface Props {
  lang: Lang
  disabled?: boolean
  onKey: (k: string) => void
  onBackspace: () => void
}

/** On-screen keyboard so Arabic works on any device, and no native keyboard covers the screen. */
export function Keyboard({ lang, disabled, onKey, onBackspace }: Props) {
  return (
    <div className={`keyboard ${lang === 'ar' ? 'kb-ar' : ''}`} dir="ltr" lang={lang}>
      {rows[lang].map((row) => (
        <div className="kb-row" key={row}>
          {[...row].map((k) => (
            <button key={k} type="button" className="kb-key" disabled={disabled} onClick={() => onKey(k)}>
              {k}
            </button>
          ))}
        </div>
      ))}
      <div className="kb-row">
        <button type="button" className="kb-key kb-space" disabled={disabled} onClick={() => onKey(' ')}>
          ␣
        </button>
        <button type="button" className="kb-key kb-wide" disabled={disabled} onClick={onBackspace} aria-label="מחיקה">
          ⌫
        </button>
      </div>
    </div>
  )
}
