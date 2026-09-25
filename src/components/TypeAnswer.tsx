import { useEffect, useRef, useState } from 'react'
import { isCorrectTyped } from '../engine/check'
import { inLang } from '../data/courses'
import type { Lang, Word } from '../types'
import type { ExerciseProps } from './exerciseProps'
import { Keyboard } from './Keyboard'
import { dirOf, Txt } from './Txt'

const allowed: Record<Lang, RegExp> = {
  en: /^[a-zA-Z' -]$/,
  ar: /^[\u0600-\u06FF ]$/,
  bg: /^[\u0400-\u04FF ]$/,
}

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

  return (
    <div className="exercise">
      <h2 className="title">כתבו {inLang(lang)}</h2>
      <div className="prompt">
        <Txt lang="he" className="big-word">
          {word.he}
        </Txt>
      </div>
      <div className="typed" lang={lang} dir={dirOf(lang)}>
        {text || <span className="placeholder">…</span>}
      </div>
      <Keyboard lang={lang} disabled={done} onKey={(k) => setText((t) => t + k)} onBackspace={() => setText((t) => t.slice(0, -1))} />
      <button className="btn btn-primary" disabled={done || !text.trim()} onClick={check}>
        בדיקה
      </button>
    </div>
  )
}
