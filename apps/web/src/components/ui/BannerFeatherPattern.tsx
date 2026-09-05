import React from 'react'

/**
 * Plumas decorativas estáticas para banners Navy (DashboardHero, MovementsHeader, BalanceHero, ChatHeader, NewExpenseHeader).
 * Las plumas están ordenadas y rotadas de forma orgánica/aleatoria en la superficie con opacidad muy sutil (3% - 6%),
 * simulando una trama infinita / marca de agua integrada sin interferir en el contenido ni en el rendimiento.
 */

interface FeatherConfig {
  source: string
  top: string
  left: string
  width: number
  rotate: number
  opacity: number
}

const BANNER_FEATHERS: FeatherConfig[] = [
  { source: '/brand/feathers/feather-01.png', top: '-15%', left: '4%', width: 72, rotate: 28, opacity: 0.045 },
  { source: '/brand/feathers/feather-04.png', top: '12%', left: '18%', width: 85, rotate: -25, opacity: 0.04 },
  { source: '/brand/feathers/feather-07.png', top: '-25%', left: '34%', width: 90, rotate: 15, opacity: 0.05 },
  { source: '/brand/feathers/feather-02.png', top: '22%', left: '48%', width: 68, rotate: -18, opacity: 0.035 },
  { source: '/brand/feathers/feather-09.png', top: '-10%', left: '64%', width: 82, rotate: 32, opacity: 0.045 },
  { source: '/brand/feathers/feather-05.png', top: '15%', left: '78%', width: 76, rotate: -35, opacity: 0.04 },
  { source: '/brand/feathers/feather-11.png', top: '-20%', left: '92%', width: 88, rotate: 22, opacity: 0.05 },
  { source: '/brand/feathers/feather-03.png', top: '48%', left: '8%', width: 80, rotate: -22, opacity: 0.04 },
  { source: '/brand/feathers/feather-08.png', top: '55%', left: '28%', width: 74, rotate: 38, opacity: 0.038 },
  { source: '/brand/feathers/feather-12.png', top: '45%', left: '56%', width: 86, rotate: -12, opacity: 0.045 },
  { source: '/brand/feathers/feather-06.png', top: '60%', left: '72%', width: 70, rotate: 25, opacity: 0.035 },
  { source: '/brand/feathers/feather-10.png', top: '50%', left: '88%', width: 84, rotate: -30, opacity: 0.042 },
  { source: '/brand/feathers/feather-02.png', top: '75%', left: '2%', width: 78, rotate: 18, opacity: 0.04 },
  { source: '/brand/feathers/feather-05.png', top: '80%', left: '20%', width: 82, rotate: -28, opacity: 0.035 },
  { source: '/brand/feathers/feather-01.png', top: '78%', left: '42%', width: 72, rotate: 35, opacity: 0.045 },
  { source: '/brand/feathers/feather-07.png', top: '82%', left: '62%', width: 88, rotate: -20, opacity: 0.04 },
  { source: '/brand/feathers/feather-04.png', top: '76%', left: '82%', width: 75, rotate: 16, opacity: 0.038 },
]

export default function BannerFeatherPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {BANNER_FEATHERS.map((f, i) => (
        <div
          key={i}
          className="absolute transform-gpu filter brightness-150 invert dark:brightness-125 dark:invert"
          style={{
            top: f.top,
            left: f.left,
            width: `${f.width}px`,
            transform: `rotate(${f.rotate}deg)`,
            opacity: f.opacity,
          }}
        >
          <img
            src={f.source}
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  )
}
