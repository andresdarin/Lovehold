import type { RankTier, RankDivision } from './ranks.types'

const TIER_COLORS: Record<string, { fill: string; stroke: string; accent: string }> = {
  stone: { fill: '#78716c', stroke: '#a8a29e', accent: '#57534e' },
  copper: { fill: '#a0522d', stroke: '#cd7f32', accent: '#8b4513' },
  bronze: { fill: '#8b6914', stroke: '#b8860b', accent: '#6b4f0a' },
  silver: { fill: '#71717a', stroke: '#a1a1aa', accent: '#52525b' },
  gold: { fill: '#b8860b', stroke: '#daa520', accent: '#8b6914' },
  emerald: { fill: '#047857', stroke: '#34d399', accent: '#065f46' },
  sapphire: { fill: '#1d4ed8', stroke: '#60a5fa', accent: '#1e3a8a' },
  violet: { fill: '#6d28d9', stroke: '#a78bfa', accent: '#4c1d95' },
  pearl: { fill: '#78716c', stroke: '#e5e7eb', accent: '#6b7280' },
  ruby: { fill: '#b91c1c', stroke: '#ef4444', accent: '#7f1d1d' },
  imperial: { fill: '#5b21b6', stroke: '#c084fc', accent: '#9333ea' },
  prism: { fill: '#be185d', stroke: '#fb7185', accent: '#e11d48' },
}

interface RankShieldProps {
  tier: RankTier
  division: RankDivision
  colorLabel: string
  size?: number
  unlocked?: boolean
}

export function RankShield({ tier, division, colorLabel, size = 72, unlocked = true }: RankShieldProps) {
  const c = TIER_COLORS[colorLabel]!
  const label = tier.charAt(0).toUpperCase()
  const divLabel = division ?? ''

  const opacity = unlocked ? 1 : 0.25

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      style={{ opacity }}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`shield-grad-${tier}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c.fill} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <path
        d="M36 4L8 16v16C8 42.667 18.667 56 36 64c17.333-8 28-21.333 28-32V16L36 4z"
        fill={`url(#shield-grad-${tier})`}
        stroke={c.stroke}
        strokeWidth="1.5"
        strokeOpacity={0.6}
      />

      <path
        d="M36 8L14 18v14c0 9.333 9.333 20.667 22 28 12.667-7.333 22-18.667 22-28V18L36 8z"
        fill={c.fill}
        fillOpacity={0.15}
        stroke={c.stroke}
        strokeWidth="1"
        strokeOpacity={0.4}
      />

      <text
        x="36"
        y={divLabel ? 32 : 38}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={c.stroke}
        fontSize="20"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        {label}
      </text>

      {divLabel && (
        <text
          x="36"
          y="48"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={c.stroke}
          fillOpacity={0.8}
          fontSize="10"
          fontWeight="600"
          fontFamily="sans-serif"
        >
          {divLabel}
        </text>
      )}
    </svg>
  )
}
