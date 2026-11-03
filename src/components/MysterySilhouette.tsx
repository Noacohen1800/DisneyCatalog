import './MysterySilhouette.css'

interface MysterySilhouetteProps {
  // True while the reveal animation plays: the glow grows and the sparkles appear
  isRevealing: boolean
}

interface Sparkle {
  top: string
  left: string
  delay: string
  size: string
}

// Where the sparkles appear around the silhouette, and when each one twinkles
const SPARKLES: Sparkle[] = [
  { top: '6%', left: '18%', delay: '0s', size: '14px' },
  { top: '14%', left: '82%', delay: '0.25s', size: '18px' },
  { top: '46%', left: '2%', delay: '0.5s', size: '12px' },
  { top: '52%', left: '94%', delay: '0.1s', size: '14px' },
  { top: '84%', left: '14%', delay: '0.35s', size: '16px' },
  { top: '90%', left: '72%', delay: '0.6s', size: '12px' },
  { top: '30%', left: '50%', delay: '0.45s', size: '10px' },
  { top: '70%', left: '40%', delay: '0.15s', size: '10px' },
]

// A dark mouse-ears silhouette with a glowing question mark: "who could it be?"
function MysterySilhouette({ isRevealing }: MysterySilhouetteProps) {
  return (
    <div
      className={isRevealing ? 'mystery mystery--revealing' : 'mystery'}
      role="img"
      aria-label={isRevealing ? 'Revealing a mystery character' : 'A mystery character'}
    >
      <div className="mystery__glow" />

      <svg className="mystery__shape" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="mystery-fill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#4b3a8c" />
            <stop offset="100%" stopColor="#140f2b" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="112" r="62" fill="url(#mystery-fill)" />
        <circle cx="48" cy="52" r="34" fill="url(#mystery-fill)" />
        <circle cx="152" cy="52" r="34" fill="url(#mystery-fill)" />
      </svg>

      <span className="mystery__question" aria-hidden="true">
        ?
      </span>

      {isRevealing &&
        SPARKLES.map((sparkle) => (
          <span
            key={`${sparkle.top}-${sparkle.left}`}
            className="mystery__sparkle"
            style={{
              top: sparkle.top,
              left: sparkle.left,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: sparkle.delay,
            }}
            aria-hidden="true"
          />
        ))}
    </div>
  )
}

export default MysterySilhouette
