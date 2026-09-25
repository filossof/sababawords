import type { ReactNode } from 'react'
import type { Lang } from '../types'

export type TextLang = Lang | 'he'

/** Hebrew and Arabic are written right-to-left; English and Bulgarian left-to-right. */
export const dirOf = (lang: TextLang): 'rtl' | 'ltr' => (lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr')

/** Text with the right language/direction, so mixed Hebrew/English/Arabic/Bulgarian renders correctly. */
export function Txt({ lang, className, children }: { lang: TextLang; className?: string; children: ReactNode }) {
  return (
    <span lang={lang} dir={dirOf(lang)} className={className}>
      {children}
    </span>
  )
}
