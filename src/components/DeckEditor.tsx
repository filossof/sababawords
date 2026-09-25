import { useEffect, useMemo, useRef, useState } from 'react'
import { langInfo, LANGS } from '../data/courses'
import { parseWordList, wordId } from '../engine/parse'
import { runPool, translate } from '../engine/translate'
import { newDeckId, type Deck } from '../store/decks'
import type { Lang } from '../types'
import { Txt } from './Txt'

const MIN_WORDS = 4

const PLACEHOLDER: Record<Lang, string> = {
  en: 'apple\nto run\nbeautiful\nhouse',
  ar: 'تفاحة\nيجري\nجميل\nبيت',
  bg: 'ябълка\nда тичам\nкрасив\nкъща',
}

interface Entry {
  he: string
  alts: string[]
  status: 'loading' | 'ok' | 'failed'
}

interface Props {
  existing?: Deck
  onSave: (deck: Deck) => void
  onCancel: () => void
}

export function DeckEditor({ existing, onSave, onCancel }: Props) {
  // the language of an existing test can't change (its words belong to it)
  const [lang, setLang] = useState<Lang>(existing?.lang ?? 'en')
  const [step, setStep] = useState<'words' | 'review'>('words')
  const [name, setName] = useState(existing?.name ?? '')
  const [testDate, setTestDate] = useState(existing?.testDate ?? '')
  const [text, setText] = useState(
    existing ? existing.words.map((w) => w.target).join('\n') : '',
  )
  const [entries, setEntries] = useState<Record<string, Entry>>(() =>
    Object.fromEntries((existing?.words ?? []).map((w) => [w.id, { he: w.he, alts: [], status: 'ok' as const }])),
  )
  const inflight = useRef(new Set<string>())

  const { items, skipped } = useMemo(() => parseWordList(text, lang), [text, lang])

  // typed `word - translation` pairs count as already translated
  const known = (id: string): Entry | undefined => {
    const item = items.find((i) => i.id === id)
    return entries[id] ?? (item?.he ? { he: item.he, alts: [], status: 'ok' } : undefined)
  }

  function fetchOne(id: string, target: string) {
    if (inflight.current.has(id)) return Promise.resolve()
    inflight.current.add(id)
    setEntries((e) => ({ ...e, [id]: { he: '', alts: [], status: 'loading' } }))
    return translate(target, lang).then((r) => {
      inflight.current.delete(id)
      setEntries((e) => ({
        ...e,
        [id]: r ? { he: r.he, alts: r.alts, status: 'ok' } : { he: '', alts: [], status: 'failed' },
      }))
    })
  }

  useEffect(() => {
    if (step !== 'review') return
    const todo = items.filter((i) => !i.he && !entries[i.id] && !inflight.current.has(i.id))
    if (todo.length) void runPool(todo, 3, (i) => fetchOne(i.id, i.target))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const setHe = (id: string, he: string) =>
    setEntries((e) => ({ ...e, [id]: { alts: e[id]?.alts ?? [], he, status: 'ok' } }))

  async function importFile(file: File | undefined) {
    if (!file) return
    const content = await file.text()
    setText((t) => (t.trim() ? t.replace(/\s*$/, '\n') : '') + content.replace(/^﻿/, ''))
  }

  const rows = items.map((i) => ({ item: i, entry: known(i.id) }))
  const loading = rows.some((r) => r.entry?.status === 'loading' || !r.entry)
  const missing = rows.filter((r) => !r.entry?.he.trim()).length
  const canContinue = name.trim().length > 0 && items.length >= MIN_WORDS
  const canSave = canContinue && !loading && missing === 0

  function save() {
    onSave({
      id: existing?.id ?? newDeckId(),
      name: name.trim(),
      lang,
      testDate: testDate || undefined,
      words: rows.map(({ item, entry }) => ({ id: wordId(item.target, lang), target: item.target, he: entry!.he.trim() })),
    })
  }

  return (
    <div className="screen editor">
      <header className="editor-top">
        <button className="icon-btn" aria-label="חזרה" onClick={step === 'review' ? () => setStep('words') : onCancel}>
          {step === 'review' ? '→' : '✕'}
        </button>
        <h1 className="page-title">{existing ? 'עריכת מבחן' : 'מבחן חדש'}</h1>
        <span className="step-badge">{step === 'words' ? 'שלב 1 מתוך 2' : 'שלב 2 מתוך 2'}</span>
      </header>

      {step === 'words' ? (
        <>
          <label className="field">
            <span>שם המבחן</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="למשל: אנגלית – יחידה 5" maxLength={60} />
          </label>

          <label className="field">
            <span>שפת המבחן</span>
            <select
              value={lang}
              disabled={!!existing}
              onChange={(e) => setLang(e.target.value as Lang)}
              aria-label="שפת המבחן"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {langInfo[l].flag} {langInfo[l].he}
                </option>
              ))}
            </select>
            {existing && <small className="muted">אי אפשר לשנות את שפת המבחן אחרי שנוצר</small>}
          </label>

          <label className="field">
            <span>תאריך המבחן (לא חובה)</span>
            <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          </label>

          <label className="field">
            <span>המילים ב{langInfo[lang].he} – מילה או ביטוי בכל שורה</span>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER[lang]}
              dir={langInfo[lang].dir}
              lang={lang}
              spellCheck={false}
              autoCapitalize="off"
            />
          </label>
          <div className="muted hint">התרגום לעברית נעשה אוטומטית בשלב הבא, ואפשר לתקן אותו. אפשר גם לכתוב <bdi>word - תרגום</bdi> כדי לקבוע תרגום בעצמכם.</div>

          <label className="file-btn">
            📂 ייבוא מקובץ CSV / טקסט
            <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={(e) => void importFile(e.target.files?.[0])} hidden />
          </label>

          <div className={`parse-summary ${items.length >= MIN_WORDS ? 'ok' : ''}`}>
            {items.length > 0 ? `✓ זוהו ${items.length} מילים` : 'עדיין לא זוהו מילים'}
            {items.length > 0 && items.length < MIN_WORDS && ` – צריך לפחות ${MIN_WORDS}`}
          </div>

          {skipped.length > 0 && (
            <div className="skipped">
              <strong>⚠ {skipped.length} שורות דולגו:</strong>
              <ul>
                {skipped.slice(0, 5).map((s) => (
                  <li key={`${s.line}-${s.text}`}>
                    <bdi>{s.text}</bdi> – {s.reason}
                  </li>
                ))}
                {skipped.length > 5 && <li>ועוד {skipped.length - 5}…</li>}
              </ul>
            </div>
          )}

          <button className="btn btn-primary" disabled={!canContinue} onClick={() => setStep('review')}>
            תרגום המילים ←
          </button>
        </>
      ) : (
        <>
          <p className="muted hint">
            {loading ? 'מתרגם…' : 'בדקו את התרגומים. תרגום אוטומטי לא תמיד מדויק – אפשר להקליד תרגום אחר או ללחוץ על אחת האפשרויות.'}
          </p>

          <ul className="review">
            {rows.map(({ item, entry }) => {
              const e = entry ?? { he: '', alts: [], status: 'loading' as const }
              return (
                <li key={item.id} className={e.status === 'failed' || (e.status === 'ok' && !e.he.trim()) ? 'bad' : ''}>
                  <div className="review-row">
                    <Txt lang={lang} className="review-word">
                      {item.target}
                    </Txt>
                    <input
                      className="review-input"
                      dir="rtl"
                      lang="he"
                      value={e.status === 'loading' ? '' : e.he}
                      placeholder={e.status === 'loading' ? 'מתרגם…' : 'כתבו תרגום'}
                      disabled={e.status === 'loading'}
                      onChange={(ev) => setHe(item.id, ev.target.value)}
                      aria-label={`תרגום של ${item.target}`}
                    />
                    <button className="icon-btn" aria-label="תרגום מחדש" title="תרגום מחדש" onClick={() => void fetchOne(item.id, item.target)}>
                      ↻
                    </button>
                  </div>
                  {e.status === 'failed' && <div className="review-note">לא הצלחנו לתרגם – כתבו ידנית או נסו שוב.</div>}
                  {e.alts.length > 0 && (
                    <div className="chips">
                      {e.alts
                        .filter((a) => a !== e.he)
                        .map((a) => (
                          <button key={a} className="chip" onClick={() => setHe(item.id, a)}>
                            {a}
                          </button>
                        ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {missing > 0 && !loading && <div className="parse-summary">חסר תרגום ב-{missing} מילים</div>}
          <button className="btn btn-primary" disabled={!canSave} onClick={save}>
            {existing ? 'שמירה' : 'יצירת שלבים'}
          </button>
        </>
      )}
    </div>
  )
}
