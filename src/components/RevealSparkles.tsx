import './RevealSparkles.css'

interface BurstSparkle {
  top: string
  left: string
  size: string
  delay: string
}

// Little stars around the character's picture. Each one pops out once, then fades away.
const BURST_SPARKLES: BurstSparkle[] = [
  { top: '4%', left: '8%', size: '16px', delay: '0.05s' },
  { top: '-3%', left: '46%', size: '12px', delay: '0.2s' },
  { top: '6%', left: '88%', size: '18px', delay: '0.1s' },
  { top: '40%', left: '-3%', size: '12px', delay: '0.3s' },
  { top: '44%', left: '97%', size: '14px', delay: '0.15s' },
  { top: '84%', left: '6%', size: '14px', delay: '0.35s' },
  { top: '90%', left: '52%', size: '10px', delay: '0.25s' },
  { top: '82%', left: '90%', size: '16px', delay: '0.4s' },
  { top: '22%', left: '26%', size: '9px', delay: '0.5s' },
  { top: '26%', left: '74%', size: '9px', delay: '0.45s' },
]

// A soft golden glow and a burst of sparkles around the character's image,
// played once when a character is revealed. Purely decorative.
function RevealSparkles() {
  return (
    <div className="reveal-sparkles" data-testid="reveal-sparkles" aria-hidden="true">
      <div className="reveal-sparkles__glow" />
      {BURST_SPARKLES.map((sparkle) => (
        <span
          key={`${sparkle.top}-${sparkle.left}`}
          className="reveal-sparkles__star"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay,
          }}
        />
      ))}
    </div>
  )
}

export default RevealSparkles
