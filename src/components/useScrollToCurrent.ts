import { useLayoutEffect, useRef } from 'react'

/**
 * Keeps the level you are about to play in the middle of the screen.
 * Without this, coming back from a lesson drops you at the top of the map and you have to
 * scroll down to find where you were.
 */
export function useScrollToCurrent<T extends HTMLElement>(key: string | undefined) {
  const ref = useRef<T | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // 'auto' (not smooth): the screen should already be in the right place when it appears
    el.scrollIntoView({ block: 'center', behavior: 'auto' })
  }, [key])
  return ref
}
