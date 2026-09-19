export type Mood = 'happy' | 'cheer' | 'sad' | 'think' | 'wave'

/** "Sprout", the app's mascot: a little green sprout with a face that reacts to how you're doing. */
export function Mascot({ mood = 'happy', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const eyes =
    mood === 'cheer' ? (
      <>
        <path d="M34 50 Q40 43 46 50" stroke="#243b0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M54 50 Q60 43 66 50" stroke="#243b0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx="40" cy="50" rx="6" ry="7.5" fill="#fff" />
        <ellipse cx="60" cy="50" rx="6" ry="7.5" fill="#fff" />
        <circle cx={mood === 'think' ? 42 : 40.5} cy={mood === 'sad' ? 52 : 50.5} r="3.4" fill="#243b0b" />
        <circle cx={mood === 'think' ? 62 : 60.5} cy={mood === 'sad' ? 52 : 50.5} r="3.4" fill="#243b0b" />
        {mood === 'sad' && (
          <>
            <path d="M33 41 L46 45" stroke="#243b0b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M67 41 L54 45" stroke="#243b0b" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {mood === 'think' && <path d="M54 41 L67 39" stroke="#243b0b" strokeWidth="2.5" strokeLinecap="round" />}
      </>
    )

  const mouth = {
    happy: <path d="M40 64 Q50 73 60 64" stroke="#243b0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    wave: <path d="M40 64 Q50 73 60 64" stroke="#243b0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    cheer: <path d="M38 60 Q50 80 62 60 Z" fill="#243b0b" />,
    sad: <path d="M41 70 Q50 62 59 70" stroke="#243b0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    think: <path d="M43 67 L57 65" stroke="#243b0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
  }[mood]

  return (
    <svg
      className={`mascot mascot-${mood} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="הדמות של המשחק"
    >
      {/* leaves */}
      <path d="M50 30 C46 14 30 8 16 12 C18 26 32 34 50 30 Z" fill="#7be02a" stroke="#3f8f00" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 30 C56 12 72 6 86 10 C84 26 68 34 50 30 Z" fill="#58cc02" stroke="#3f8f00" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 32 L50 22" stroke="#3f8f00" strokeWidth="3" strokeLinecap="round" />
      {/* arms */}
      {(mood === 'cheer' || mood === 'wave') && (
        <>
          <ellipse className="arm arm-l" cx="21" cy="58" rx="6" ry="10" fill="#58cc02" stroke="#3f8f00" strokeWidth="2.5" transform="rotate(-25 21 58)" />
          <ellipse className="arm arm-r" cx="79" cy="58" rx="6" ry="10" fill="#58cc02" stroke="#3f8f00" strokeWidth="2.5" transform="rotate(25 79 58)" />
        </>
      )}
      {/* body */}
      <ellipse cx="50" cy="62" rx="33" ry="30" fill="#58cc02" stroke="#3f8f00" strokeWidth="3" />
      <ellipse cx="50" cy="70" rx="21" ry="17" fill="#8be83a" opacity="0.55" />
      {eyes}
      {mouth}
      <circle cx="30" cy="62" r="4.5" fill="#ff9aa8" opacity="0.7" />
      <circle cx="70" cy="62" r="4.5" fill="#ff9aa8" opacity="0.7" />
      {/* feet */}
      <ellipse cx="38" cy="92" rx="10" ry="5" fill="#3f8f00" />
      <ellipse cx="62" cy="92" rx="10" ry="5" fill="#3f8f00" />
    </svg>
  )
}
