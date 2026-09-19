import type { ReactNode } from 'react'

export type TextLang = 'he' | 'en' | 'ar'

/** Text with the right language/direction, so mixed Hebrew/English/Arabic renders correctly. */
export function Txt({ lang, className, children }: { lang: TextLang; className?: string; children: ReactNode }) {
  return (
    <span lang={lang} dir={lang === 'en' ? 'ltr' : 'rtl'} className={className}>
      {children}
    </span>
  )
}
