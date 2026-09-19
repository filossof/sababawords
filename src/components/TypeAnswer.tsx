import { useEffect, useRef, useState } from 'react'
import { isCorrectTyped } from '../engine/check'
import type { Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Keyboard } from './Keyboard'
import { Txt } from './Txt'

const allowed = { en: /^[a-zA-Z' -]$/, ar: /^[؀-ۿ ]$/ }

export function TypeAnswer({ word, lang, onDone }: ExerciseProps & { word: Word }) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)
  const latest = useRef({ text, done })
  latest.current = { text, done }

  function check() {
    if (latest.current.done || !latest.current.text.trim()) return
    setDone(true)
    onDone(isCorrectTyped(latest.current.text, word.target, lang))
  }

  // physical keyboard support on PC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (latest.current.done || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') check()
      else if (e.key === 'Backspace') setText((t) => t.slice(0, -1))
      else if (allowed[lang].test(e.key)) setText((t) => t + e.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const langName = lang === 'en' ? 'באנגלית' : 'בערבית'
  return (
    <div className="exercise">
      <h2 className="title">כתבו {langName}</h2>
      <div className="prompt">
        <Txt lang="he" className="big-word">
          {word.he}
        </Txt>
      </div>
      <div className="typed" lang={lang} dir={lang === 'en' ? 'ltr' : 'rtl'}>
        {text || <span className="placeholder">…</span>}
      </div>
      <Keyboard lang={lang} disabled={done} onKey={(k) => setText((t) => t + k)} onBackspace={() => setText((t) => t.slice(0, -1))} />
      <button className="btn btn-primary" disabled={done || !text.trim()} onClick={check}>
        בדיקה
      </button>
    </div>
  )
}
