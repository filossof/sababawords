import { useMemo, useState } from 'react'
import { langInfo } from '../data/courses'
import { parseVocab } from '../engine/parse'
import { newDeckId, type Deck } from '../store/decks'
import type { Lang } from '../types'
import { Txt } from './Txt'

const MIN_WORDS = 4

const EXAMPLE: Record<Lang, string> = {
  en: 'apple - תפוח\nto run - לרוץ\nbeautiful - יפה',
  ar: 'تفاحة - תפוח\nيجري - לרוץ\nجميل - יפה',
}

interface Props {
  existing?: Deck
  onSave: (deck: Deck) => void
  onCancel: () => void
}

export function DeckEditor({ existing, onSave, onCancel }: Props) {
  const [name, setName] = useState(existing?.name ?? '')
  const [lang, setLang] = useState<Lang>(existing?.lang ?? 'en')
  const [testDate, setTestDate] = useState(existing?.testDate ?? '')
  const [text, setText] = useState(existing ? existing.words.map((w) => `${w.target} - ${w.he}`).join('\n') : '')

  const { words, skipped } = useMemo(() => parseVocab(text, lang), [text, lang])
  const canSave = name.trim().length > 0 && words.length >= MIN_WORDS

  async function importFile(file: File | undefined) {
    if (!file) return
    const content = await file.text()
    setText((t) => (t.trim() ? t.replace(/\s*$/, '\n') : '') + content.replace(/^﻿/, ''))
  }

  function save() {
    onSave({
      id: existing?.id ?? newDeckId(),
      name: name.trim(),
      lang,
      testDate: testDate || undefined,
      words,
    })
  }

  return (
    <div className="screen editor">
      <header className="editor-top">
        <button className="icon-btn" aria-label="חזרה" onClick={onCancel}>
          ✕
        </button>
        <h1 className="page-title">{existing ? 'עריכת מבחן' : 'מבחן חדש'}</h1>
      </header>

      <label className="field">
        <span>שם המבחן</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="למשל: אנגלית – יחידה 5" maxLength={60} />
      </label>

      <div className="field">
        <span>שפה</span>
        <div className="langs">
          {(Object.keys(langInfo) as Lang[]).map((l) => (
            <button key={l} type="button" className={`pill ${l === lang ? 'active' : ''}`} onClick={() => setLang(l)}>
              {langInfo[l].flag} {langInfo[l].he}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span>תאריך המבחן (לא חובה)</span>
        <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
      </label>

      <label className="field">
        <span>רשימת המילים – מילה בכל שורה: מילה - תרגום</span>
        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE[lang]}
          dir="auto"
          spellCheck={false}
        />
      </label>

      <label className="file-btn">
        📂 ייבוא מקובץ CSV / טקסט
        <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={(e) => void importFile(e.target.files?.[0])} hidden />
      </label>

      <div className={`parse-summary ${words.length >= MIN_WORDS ? 'ok' : ''}`}>
        {words.length > 0 ? `✓ זוהו ${words.length} מילים` : 'עדיין לא זוהו מילים'}
        {words.length > 0 && words.length < MIN_WORDS && ` – צריך לפחות ${MIN_WORDS}`}
      </div>

      {words.length > 0 && (
        <ul className="preview">
          {words.slice(0, 6).map((w) => (
            <li key={w.id}>
              <Txt lang={lang}>{w.target}</Txt> <span>←</span> <Txt lang="he">{w.he}</Txt>
            </li>
          ))}
          {words.length > 6 && <li className="muted">ועוד {words.length - 6}…</li>}
        </ul>
      )}

      {skipped.length > 0 && (
        <div className="skipped">
          <strong>⚠ {skipped.length} שורות דולגו:</strong>
          <ul>
            {skipped.slice(0, 5).map((s) => (
              <li key={s.line}>
                שורה {s.line}: <bdi>{s.text}</bdi> – {s.reason}
              </li>
            ))}
            {skipped.length > 5 && <li>ועוד {skipped.length - 5}…</li>}
          </ul>
        </div>
      )}

      <button className="btn btn-primary" disabled={!canSave} onClick={save}>
        {existing ? 'שמירה' : 'יצירת שלבים'}
      </button>
    </div>
  )
}
