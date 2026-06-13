interface RankProgressBarProps {
  percent: number
  color: string
}

const BAR_COLORS: Record<string, string> = {
  stone: '#a8a29e',
  copper: '#cd7f32',
  bronze: '#b8860b',
  silver: '#a1a1aa',
  gold: '#daa520',
  emerald: '#34d399',
  sapphire: '#60a5fa',
  violet: '#a78bfa',
  pearl: '#e5e7eb',
  ruby: '#ef4444',
  imperial: '#c084fc',
  prism: '#fb7185',
}

export function RankProgressBar({ percent, color }: RankProgressBarProps) {
  const barColor = BAR_COLORS[color] ?? '#a8a29e'

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: barColor,
        }}
      />
    </div>
  )
}
