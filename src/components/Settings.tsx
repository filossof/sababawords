import { useState } from 'react'
import { speak, useVoiceList } from '../audio'
import { langInfo, LANGS } from '../data/courses'
import { testSound } from '../sound'
import type { Progress } from '../store/progress'
import type { Lang } from '../types'

interface Props {
  progress: Progress
  /** how many test decks exist – shown so the reset warning is concrete */
  deckCount: number
  onResetLearning: () => void
  onResetEverything: () => void
  onSound: (on: boolean) => void
  onVoice: (lang: Lang, name: string) => void
  onTranslit: (v: boolean) => void
}

const SAMPLE: Record<Lang, string> = { en: 'white, wait, weight', ar: 'مرحبا، كيف حالك؟', bg: 'Здравей, как си?' }

function VoicePicker({ lang, value, onVoice }: { lang: Lang; value: string; onVoice: Props['onVoice'] }) {
  const voices = useVoiceList(lang)
  return (
    <div className="setting-row">
      <label className="setting-label" htmlFor={`voice-${lang}`}>
        {langInfo[lang].flag} קול ההקראה ב{langInfo[lang].he}
      </label>
      {voices.length === 0 ? (
        <div className="muted">אין במכשיר הזה קול ל{langInfo[lang].he} – תרגילי ההאזנה יוסתרו.</div>
      ) : (
        <div className="setting-controls">
          <select id={`voice-${lang}`} value={value} onChange={(e) => onVoice(lang, e.target.value)} aria-label={`קול ההקראה ב${langInfo[lang].he}`}>
            <option value="">אוטומטי (מומלץ)</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <button className="btn btn-ghost small" onClick={() => speak(SAMPLE[lang], lang)}>
            ▶ נסו
          </button>
        </div>
      )}
    </div>
  )
}

export function Settings({ progress, deckCount, onSound, onVoice, onTranslit, onResetLearning, onResetEverything }: Props) {
  const [soundCheck, setSoundCheck] = useState('')
  const [done, setDone] = useState('')

  const confirmReset = (question: string, run: () => void, message: string) => () => {
    if (!window.confirm(question)) return
    run()
    setDone(message)
  }

  return (
    <div className="screen settings-screen">
      <h1 className="page-title">⚙️ הגדרות</h1>

      <section className="settings-card">
        <h2>🔔 צלילים</h2>
        <label className="setting-row switch-row">
          <span className="setting-label">צלילי לחיצה ותשובות</span>
          <input type="checkbox" className="switch" checked={progress.soundOn} onChange={(e) => onSound(e.target.checked)} />
        </label>
        <div className="setting-row">
          <button
            className="btn btn-ghost small"
            onClick={() =>
              void testSound().then((ok) =>
                setSoundCheck(
                  ok
                    ? 'הצליל נוגן. לא שמעתם? העלו את עוצמת המדיה בטלפון ובדקו שהאוזניות לא מחוברות.'
                    : progress.soundOn
                      ? 'הדפדפן חסם את הצליל – הקישו שוב.'
                      : 'הצלילים כבויים – הפעילו אותם למעלה.',
                ),
              )
            }
          >
            🔔 בדיקת צליל
          </button>
          {soundCheck && <div className="muted">{soundCheck}</div>}
        </div>
      </section>

      <section className="settings-card">
        <h2>🗣️ קול ההקראה</h2>
        {LANGS.map((l) => (
          <VoicePicker key={l} lang={l} value={progress.voices[l] ?? ''} onVoice={onVoice} />
        ))}
      </section>

      <section className="settings-card">
        <h2>🇸🇦 ערבית</h2>
        <label className="setting-row switch-row">
          <span className="setting-label">הצגת תעתיק באותיות עבריות</span>
          <input type="checkbox" className="switch" checked={progress.showTranslit} onChange={(e) => onTranslit(e.target.checked)} />
        </label>
      </section>

      <section className="settings-card danger">
        <h2>🧹 התחלה מחדש</h2>
        <div className="setting-row">
          <button
            className="btn btn-ghost small"
            onClick={confirmReset(
              'לאפס את התקדמות הלימוד? כל השלבים יינעלו והנקודות והרצף יתאפסו. המבחנים שיצרתם יישארו.',
              onResetLearning,
              'התקדמות הלימוד אופסה.',
            )}
          >
            🔄 איפוס התקדמות הלימוד
          </button>
          <span className="muted">השלבים, הנקודות והרצף – המבחנים נשארים</span>
        </div>
        <div className="setting-row">
          <button
            className="btn btn-danger small"
            onClick={confirmReset(
              `למחוק הכול? גם התקדמות הלימוד וגם ${deckCount} המבחנים שיצרתם יימחקו. אי אפשר לבטל.`,
              onResetEverything,
              'הכול נמחק – אפשר להתחיל מהתחלה.',
            )}
          >
            🗑 מחיקת הכול
          </button>
          <span className="muted">
            גם התקדמות הלימוד וגם המבחנים ({deckCount})
          </span>
        </div>
        {done && <div className="parse-summary ok">{done}</div>}
      </section>
    </div>
  )
}
