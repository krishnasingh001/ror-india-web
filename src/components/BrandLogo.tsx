import { useEffect, useId, useState } from 'react'

type BrandLogoProps = {
  className?: string
  showWordmark?: boolean
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

function OrbitDot({
  pathId,
  duration,
  begin,
  r,
  fill,
  depth,
}: {
  pathId: string
  duration: string
  begin: string
  r: number
  fill: string
  depth: 'front' | 'back'
}) {
  const opacityValues = depth === 'front' ? '1;1;0;0;1' : '0;0;1;1;0'

  return (
    <circle r={r} fill={fill} opacity={depth === 'front' ? 1 : 0}>
      <animateMotion dur={duration} begin={begin} repeatCount="indefinite">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        values={opacityValues}
        keyTimes="0;0.2;0.34;0.66;0.8"
        calcMode="linear"
        dur={duration}
        begin={begin}
        repeatCount="indefinite"
      />
    </circle>
  )
}

/**
 * Premium 3D ROR World mark — soft glow, depth-layered thin orbits, staggered dots.
 */
function BrandMark({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const reduceMotion = usePrefersReducedMotion()
  const animate = !reduceMotion

  const nodeGrad = `${uid}-node`
  const glowGrad = `${uid}-glow`
  const gemFilter = `${uid}-gem-fx`
  const pathV = `${uid}-v`
  const pathA = `${uid}-a`
  const pathB = `${uid}-b`
  const fill = `url(#${nodeGrad})`

  const orbits = [
    { pathId: pathV, duration: '10s', begin: '0s', r: 2.9 },
    { pathId: pathA, duration: '15.5s', begin: '-5s', r: 2.4 },
    { pathId: pathB, duration: '22s', begin: '-11s', r: 2.65 },
  ] as const

  return (
    <svg
      viewBox="0 0 100 100"
      className={`brand-logo-mark ${className}`}
      width={48}
      height={48}
      aria-hidden
    >
      <defs>
        <radialGradient id={nodeGrad} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="35%" stopColor="#EF4444" />
          <stop offset="75%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>

        {/* Soft atmosphere behind the gem — not a hard cut */}
        <radialGradient id={glowGrad} cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.45" />
          <stop offset="45%" stopColor="#FECACA" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <filter id={gemFilter} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#DC2626" floodOpacity="0.28" />
          <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Ambient glow — gives gem “presence” without fading the diamond itself */}
      <circle cx="50" cy="50" r="34" fill={`url(#${glowGrad})`} className="brand-logo-glow" />

      {/* ===== BACK rings (lighter, thinner) — upper/far arcs only ===== */}
      <g fill="none" stroke="#64748B" strokeWidth="0.75" strokeLinecap="round" opacity="0.9">
        {/* Vertical — back = upper half */}
        <path d="M30 50 A20 46 0 0 1 70 50" />
        <g transform="rotate(-40 50 50)">
          <path d="M4 50 A46 19 0 0 1 96 50" />
        </g>
        <g transform="rotate(40 50 50)">
          <path d="M4 50 A46 19 0 0 0 96 50" />
        </g>
      </g>

      {/* Motion paths (invisible) */}
      <g>
        <path id={pathV} d="M50 4 A20 46 0 1 1 50 96 A20 46 0 1 1 50 4" fill="none" />
        {animate && (
          <OrbitDot
            pathId={pathV}
            duration={orbits[0].duration}
            begin={orbits[0].begin}
            r={orbits[0].r}
            fill={fill}
            depth="back"
          />
        )}
      </g>
      <g transform="rotate(-40 50 50)">
        <path id={pathA} d="M4 50 A46 19 0 1 1 96 50 A46 19 0 1 1 4 50" fill="none" />
        {animate && (
          <OrbitDot
            pathId={pathA}
            duration={orbits[1].duration}
            begin={orbits[1].begin}
            r={orbits[1].r}
            fill={fill}
            depth="back"
          />
        )}
      </g>
      <g transform="rotate(40 50 50)">
        <path id={pathB} d="M4 50 A46 19 0 1 1 96 50 A46 19 0 1 1 4 50" fill="none" />
        {animate && (
          <OrbitDot
            pathId={pathB}
            duration={orbits[2].duration}
            begin={orbits[2].begin}
            r={orbits[2].r}
            fill={fill}
            depth="back"
          />
        )}
      </g>

      {reduceMotion && (
        <g fill={fill}>
          <circle cx="50" cy="8" r="2.8" />
          <circle cx="14" cy="58" r="2.4" />
          <circle cx="86" cy="38" r="2.6" />
        </g>
      )}

      {/* ===== GEM — crisp, with soft depth (not faded) ===== */}
      <g transform="translate(50 50) rotate(42)">
        <image
          href="/ruby-gem.png"
          x={-20}
          y={-20}
          width={40}
          height={40}
          className="brand-logo-ruby"
          filter={`url(#${gemFilter})`}
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      {/* ===== FRONT rings — near arcs wrap over gem (true 3D) ===== */}
      <g fill="none" stroke="#475569" strokeWidth="0.9" strokeLinecap="round" opacity="0.95">
        {/* Vertical — front = lower half */}
        <path d="M30 50 A20 46 0 0 0 70 50" />
        <g transform="rotate(-40 50 50)">
          <path d="M4 50 A46 19 0 0 0 96 50" />
        </g>
        <g transform="rotate(40 50 50)">
          <path d="M4 50 A46 19 0 0 1 96 50" />
        </g>
      </g>

      {/* Front-pass dots (drawn above gem) */}
      {animate && (
        <>
          <g>
            <OrbitDot
              pathId={pathV}
              duration={orbits[0].duration}
              begin={orbits[0].begin}
              r={orbits[0].r}
              fill={fill}
              depth="front"
            />
          </g>
          <g transform="rotate(-40 50 50)">
            <OrbitDot
              pathId={pathA}
              duration={orbits[1].duration}
              begin={orbits[1].begin}
              r={orbits[1].r}
              fill={fill}
              depth="front"
            />
          </g>
          <g transform="rotate(40 50 50)">
            <OrbitDot
              pathId={pathB}
              duration={orbits[2].duration}
              begin={orbits[2].begin}
              r={orbits[2].r}
              fill={fill}
              depth="front"
            />
          </g>
        </>
      )}
    </svg>
  )
}

export function BrandLogo({ className = '', showWordmark = true }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 [--logo-size:2.75rem] sm:[--logo-size:3rem] ${className}`}
    >
      <BrandMark className="h-[var(--logo-size)] w-[var(--logo-size)] shrink-0" />
      {showWordmark && (
        <span className="brand-wordmark whitespace-nowrap text-[calc(var(--logo-size)*0.52)] leading-none">
          <span className="brand-wordmark-ror">ROR</span>
          <span className="brand-wordmark-world">World</span>
        </span>
      )}
    </span>
  )
}
