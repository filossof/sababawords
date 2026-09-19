/**
 * English → Hebrew translation for test-prep word lists, called straight from the browser.
 *
 * Primary: Google's public web translate endpoint (unofficial, but free, CORS-enabled and accurate,
 * with alternative meanings). Fallback: MyMemory (official free API, less accurate).
 * Results are cached on the device, and the editor always lets a human correct them.
 */
export interface Translation {
  he: string
  /** other possible meanings, best first */
  alts: string[]
}

const HEBREW = /[֐-׿]/
const NIQQUD = /[֑-ׇ]/g
const TIMEOUT_MS = 8000

const tidy = (s: string) => s.replace(NIQQUD, '').replace(/\s+/g, ' ').trim()
const unique = (xs: string[]) => [...new Set(xs)]

async function getJson(url: string): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** Response shape: [[[translated, original, …], …], [[partOfSpeech, [words…], …], …], …] */
export async function viaGoogle(text: string): Promise<Translation | null> {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=iw&dt=t&dt=bd&q=' +
    encodeURIComponent(text)
  const data = (await getJson(url)) as unknown[]
  const segments = (data[0] as unknown[][] | null) ?? []
  const he = tidy(segments.map((s) => String(s[0] ?? '')).join(''))
  if (!HEBREW.test(he)) return null
  const dictionary = (data[1] as unknown[][] | null) ?? []
  const alts = unique(dictionary.flatMap((group) => (group[1] as string[]).map(tidy)))
    .filter((a) => HEBREW.test(a) && a !== he)
    .slice(0, 5)
  return { he, alts }
}

export async function viaMyMemory(text: string): Promise<Translation | null> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en%7Che`
  const data = (await getJson(url)) as {
    responseStatus: number | string
    responseData: { translatedText: string }
    matches?: { translation: string }[]
  }
  if (Number(data.responseStatus) !== 200) return null
  const he = tidy(data.responseData.translatedText)
  if (!HEBREW.test(he) || he.startsWith('MYMEMORY')) return null
  const alts = unique((data.matches ?? []).map((m) => tidy(m.translation)))
    .filter((a) => HEBREW.test(a) && a !== he)
    .slice(0, 4)
  return { he, alts }
}

const CACHE_KEY = 'sababawords:translations:v1'
const cacheKey = (text: string) => text.trim().toLowerCase()

function readCache(): Record<string, Translation> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Translates one word or phrase; null when every source failed (offline, blocked, unknown word). */
export async function translate(text: string): Promise<Translation | null> {
  const key = cacheKey(text)
  const hit = readCache()[key]
  if (hit) return hit

  let result: Translation | null = null
  for (const source of [viaGoogle, viaMyMemory]) {
    try {
      result = await source(text)
    } catch {
      result = null
    }
    if (result) break
  }
  if (result) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [key]: result }))
    } catch {
      /* cache is best-effort */
    }
  }
  return result
}

/** Runs `task` over `items` with at most `limit` in flight. */
export async function runPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items]
  const worker = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) await task(item)
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
}
