import { LANGS } from '../data/courses'
import type { Lang } from '../types'

export interface SharedDeck {
  name: string
  lang: Lang
  testDate?: string
  /** [target, hebrew] pairs */
  words: [string, string][]
}

const toB64Url = (bytes: Uint8Array) => {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream))
  return new Uint8Array(await out.arrayBuffer())
}

/** Deck → URL-safe string (deflate-compressed when the browser supports it). */
export async function encodeDeck(deck: SharedDeck): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(deck))
  if (typeof CompressionStream !== 'undefined') {
    try {
      return 'z.' + toB64Url(await pipe(raw, new CompressionStream('deflate-raw')))
    } catch {
      /* fall through to uncompressed */
    }
  }
  return 'j.' + toB64Url(raw)
}

export async function decodeDeck(code: string): Promise<SharedDeck | null> {
  try {
    const [kind, body] = [code.slice(0, 2), code.slice(2)]
    let bytes: Uint8Array = fromB64Url(body)
    if (kind === 'z.') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'))
    else if (kind !== 'j.') return null
    const d = JSON.parse(new TextDecoder().decode(bytes)) as SharedDeck
    const ok =
      typeof d.name === 'string' &&
      LANGS.includes(d.lang) &&
      Array.isArray(d.words) &&
      d.words.every((w) => Array.isArray(w) && typeof w[0] === 'string' && typeof w[1] === 'string')
    return ok ? d : null
  } catch {
    return null
  }
}

export const HASH_PREFIX = '#deck='

export async function shareUrl(deck: SharedDeck): Promise<string> {
  return `${location.origin}${location.pathname}${HASH_PREFIX}${await encodeDeck(deck)}`
}
