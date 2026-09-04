'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LoaderCircle, ArrowRight } from 'lucide-react'

/**
 * Encabezado de marca Finnic centrado con jerarquía editorial Navy.
 */
export function AuthBrand({
  title = 'FINNIC',
  subtitle = 'Tu copiloto financiero',
  tagline,
}: {
  title?: string
  subtitle?: string
  tagline?: string
}) {
  return (
    <header className="flex flex-col items-center text-center select-none">
      {/* Logotipo Horizontal Completo Finnic (Transparente Light/Dark) */}
      <div className="flex items-center justify-center mb-3">
        <img
          src="/brand/finnic-logo-navy.png"
          alt="Finnic Logo"
          className="h-10 sm:h-12 w-auto object-contain dark:hidden drop-shadow-xs"
        />
        <img
          src="/brand/finnic-logo-cream.png"
          alt="Finnic Logo"
          className="hidden h-10 sm:h-12 w-auto object-contain dark:block drop-shadow-[0_4px_16px_rgba(192,213,214,0.2)]"
        />
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-[2.2rem] font-extrabold tracking-tight text-navy dark:text-foreground leading-tight">
        {title}
      </h1>
      <p className="mt-1.5 text-xs sm:text-sm font-medium text-navy/75 dark:text-text-secondary tracking-wide max-w-[280px] sm:max-w-none">
        {subtitle}
      </p>
      {tagline && (
        <p className="mt-1 text-xs text-text-secondary">
          {tagline}
        </p>
      )}
    </header>
  )
}

/**
 * Campo de entrada horizontal estilizado para glassmorphism mate y cálido con autofill armonizado.
 */
interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: React.ReactNode
  rightElement?: React.ReactNode
}

export function AuthField({
  id,
  label,
  icon,
  rightElement,
  className = '',
  ...props
}: AuthFieldProps) {
  return (
    <div className="group relative flex flex-col justify-center px-4 sm:px-5 py-3.5 sm:py-4 transition-colors focus-within:bg-sand/30 dark:focus-within:bg-surface-alt/30">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-3.5">
        <span className="shrink-0 transition-colors">
          {icon}
        </span>
        <input
          id={id}
          className={`auth-input w-full bg-transparent text-sm sm:text-base font-medium text-navy dark:text-foreground placeholder:text-navy/45 dark:placeholder:text-muted-foreground/50 focus:outline-none ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="shrink-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * CTA circular sólido (100% opaco) con protagonismo Navy en Light y Aqua en Dark.
 */
export function AuthSubmitButton({
  loading,
  disabled,
  ariaLabel,
  className = '',
}: {
  loading?: boolean
  disabled?: boolean
  ariaLabel: string
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`group relative flex h-14 w-14 sm:h-15 sm:w-15 shrink-0 items-center justify-center rounded-full bg-[#083A4F] text-[#F5F2EE] dark:bg-[#C0D5D6] dark:text-[#083A4F] border-2 border-[#083A4F] dark:border-[#C0D5D6] shadow-xl shadow-[#083A4F]/35 dark:shadow-black/60 transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-[#0B465D] hover:border-[#0B465D] dark:hover:bg-[#D3E3E4] dark:hover:border-[#D3E3E4] active:bg-[#062c3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none ${className}`}
    >
      {loading ? (
        <LoaderCircle className="h-6 w-6 animate-spin stroke-[2.4]" />
      ) : (
        <ArrowRight className="h-6 w-6 stroke-[2.4] transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  )
}

/**
 * Colección de las 12 plumas individuales limpias (sin repetición del modelo de pluma).
 * Configuradas con desfases iniciales negativos y lapsos orgánicos para garantizar
 * un flujo constante y poblado en pantalla en todo momento sin vacíos.
 */
const FEATHER_ITEMS = [
  { id: 1, src: '/brand/feathers/feather-01.png', left: '5%',   startY: -10, duration: 18, delay: 0,   sway: 20, rotate: [12, -10, 15],   scale: 0.9,  opacity: 0.07 },
  { id: 2, src: '/brand/feathers/feather-02.png', left: '86%',  startY: 35,  duration: 22, delay: -8,  sway: -22, rotate: [-15, 8, -12],  scale: 0.95, opacity: 0.06 },
  { id: 3, src: '/brand/feathers/feather-03.png', left: '20%',  startY: 70,  duration: 19, delay: -14, sway: 25, rotate: [20, -15, 18],   scale: 0.85, opacity: 0.065 },
  { id: 4, src: '/brand/feathers/feather-04.png', left: '74%',  startY: 15,  duration: 24, delay: -4,  sway: -18, rotate: [-25, 15, -20], scale: 0.9,  opacity: 0.07 },
  { id: 5, src: '/brand/feathers/feather-05.png', left: '12%',  startY: 55,  duration: 21, delay: -11, sway: 22, rotate: [8, -12, 10],    scale: 0.8,  opacity: 0.06 },
  { id: 6, src: '/brand/feathers/feather-06.png', left: '60%',  startY: -15, duration: 19, delay: -2,  sway: -26, rotate: [-30, 20, -25], scale: 1.0,  opacity: 0.075 },
  { id: 7, src: '/brand/feathers/feather-07.png', left: '32%',  startY: 40,  duration: 23, delay: -9,  sway: 18, rotate: [5, -18, 12],    scale: 0.85, opacity: 0.065 },
  { id: 8, src: '/brand/feathers/feather-08.png', left: '93%',  startY: 80,  duration: 20, delay: -16, sway: -20, rotate: [-12, 22, -15], scale: 0.9,  opacity: 0.065 },
  { id: 9, src: '/brand/feathers/feather-09.png', left: '46%',  startY: 25,  duration: 25, delay: -6,  sway: 24, rotate: [25, -20, 20],   scale: 0.95, opacity: 0.07 },
  { id: 10, src: '/brand/feathers/feather-10.png', left: '80%', startY: 65,  duration: 22, delay: -13, sway: -18, rotate: [-18, 10, -14], scale: 0.85, opacity: 0.06 },
  { id: 11, src: '/brand/feathers/feather-11.png', left: '2%',  startY: 85,  duration: 20, delay: -17, sway: 22, rotate: [15, -25, 18],   scale: 0.95, opacity: 0.075 },
  { id: 12, src: '/brand/feathers/feather-12.png', left: '40%', startY: 5,   duration: 26, delay: -1,  sway: -24, rotate: [-10, 16, -8],  scale: 0.9,  opacity: 0.065 },
]

/**
 * Fondo sobrio ambiental para Login con las 12 plumas individuales en flujo continuo descendente.
 * Color sobrio arena cálida en light mode y navy profundo refinado en dark mode.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Base cromática sobria y refinada */}
      <div className="absolute inset-0 bg-[#F5F2EC] dark:bg-[#071A24] transition-colors duration-700" />

      {/* Halo tonal sutil en el centro */}
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[600px] rounded-full bg-sand/30 dark:bg-navy/20 blur-3xl" />

      {/* Capa de plumas en flujo continuo (12 plumas únicas intercaladas, sin repetición) */}
      <div className="absolute inset-0 overflow-hidden">
        {FEATHER_ITEMS.map((feather) => (
          <motion.div
            key={feather.id}
            initial={{
              y: '-25vh',
              x: 0,
              rotate: feather.rotate[0],
            }}
            animate={{
              y: '125vh',
              x: [0, feather.sway, -feather.sway * 0.7, feather.sway * 0.5, 0],
              rotate: feather.rotate,
            }}
            transition={{
              duration: feather.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: feather.delay,
              x: {
                duration: feather.duration * 0.4,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              },
              rotate: {
                duration: feather.duration * 0.45,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              },
            }}
            style={{
              position: 'absolute',
              left: feather.left,
              width: `${Math.round(84 * feather.scale)}px`,
              opacity: feather.opacity,
            }}
            className="dark:invert dark:brightness-125 pointer-events-none filter drop-shadow-xs"
          >
            <img
              src={feather.src}
              alt=""
              aria-hidden="true"
              className="w-full h-auto object-contain"
            />
          </motion.div>
        ))}
      </div>

      {/* Filtro de calidez y suavizado óptico */}
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />

      {/* Gradientes de viñeta suaves para preservar legibilidad absoluta */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center,_transparent_30%,_#F5F2EC_90%] dark:bg-radial-[ellipse_at_center,_transparent_30%,_#071A24_90%] opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />
    </div>
  )
}
