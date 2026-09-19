const COLORS = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff9600']

/** A burst of falling confetti (pure CSS). Pieces are spread deterministically so it renders the same every time. */
export function Confetti({ pieces = 44 }: { pieces?: number }) {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => {
        const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280
        return (
          <span
            key={i}
            style={{
              left: `${r(1) * 100}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${r(2) * 0.9}s`,
              animationDuration: `${2.2 + r(3) * 1.6}s`,
              width: `${6 + r(4) * 6}px`,
              height: `${10 + r(5) * 8}px`,
              transform: `rotate(${r(6) * 360}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}
