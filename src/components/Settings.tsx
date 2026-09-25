import { useState } from 'react'
import { speak, useVoiceList, useVoiceStatus, type Listening } from '../audio'
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
  onListening: (mode: Listening) => void
  onTranslit: (v: boolean) => void
}

const SAMPLE: Record<Lang, string> = { en: 'white, wait, weight', ar: 'مرحبا، كيف حالك؟', bg: 'Здравей, как си?' }

const RESULT: Record<string, string> = {
  spoken: '✓ נשמע? מצוין – ההקראה עובדת.',
  failed: 'הדפדפן לא הצליח להקריא. נסו שוב, ואם זה חוזר – התקינו קול לשפה הזאת בהגדרות המכשיר.',
  unsupported: 'הדפדפן הזה לא תומך בהקראה.',
}

function VoicePicker({ lang, value, onVoice }: { lang: Lang; value: string; onVoice: Props['onVoice'] }) {
  const voices = useVoiceList(lang)
  const status = useVoiceStatus(lang)
  const [result, setResult] = useState('')

  return (
    <div className="setting-row">
      <label className="setting-label" htmlFor={`voice-${lang}`}>
        {langInfo[lang].flag} קול ההקראה ב{langInfo[lang].he}
      </label>
      <div className="setting-controls">
        {voices.length > 0 ? (
          <select id={`voice-${lang}`} value={value} onChange={(e) => onVoice(lang, e.target.value)} aria-label={`קול ההקראה ב${langInfo[lang].he}`}>
            <option value="">אוטומטי (מומלץ)</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        ) : (
          <span className="muted">
            {status === 'unknown'
              ? 'המכשיר עדיין לא דיווח על הקולות שלו – ההקראה כנראה תעבוד בכל זאת.'
              : `לא נמצא במכשיר קול ל${langInfo[lang].he}. אפשר לנסות בכל זאת:`}
          </span>
        )}
        <button className="btn btn-ghost small" onClick={() => void speak(SAMPLE[lang], lang).then((r) => setResult(RESULT[r]))}>
          ▶ נסו
        </button>
      </div>
      {result && <div className="muted">{result}</div>}
      {status === 'missing' && (
        <details className="help">
          <summary>לא מצליח? איך מוסיפים קול במכשיר</summary>
          <ul>
            <li>
              <strong>אנדרואיד:</strong> הגדרות → ניהול כללי / מערכת → טקסט לדיבור (Text-to-speech) → ליד מנוע Google → הורדת
              נתוני קול, ובחרו {langInfo[lang].he}.
            </li>
            <li>
              <strong>אייפון:</strong> הגדרות → נגישות → תוכן מדובר → קולות → {langInfo[lang].he}.
            </li>
            <li>אחרי ההתקנה חזרו לכאן, רעננו את הדף והקישו שוב על "נסו".</li>
          </ul>
        </details>
      )}
    </div>
  )
}

export function Settings({ progress, deckCount, onSound, onVoice, onTranslit, onListening, onResetLearning, onResetEverything }: Props) {
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

        <div className="setting-row">
          <label className="setting-label" htmlFor="listening">
            תרגילי האזנה
          </label>
          <select id="listening" value={progress.listening} onChange={(e) => onListening(e.target.value as Listening)}>
            <option value="auto">אוטומטי – לפי מה שהמכשיר תומך</option>
            <option value="on">תמיד להציג</option>
            <option value="off">לא להציג</option>
          </select>
          <span className="muted">אם יש הקראה במכשיר אבל תרגילי ההאזנה לא מופיעים, בחרו "תמיד להציג".</span>
        </div>
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
