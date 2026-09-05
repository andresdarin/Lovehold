'use client'

import React from 'react'

interface FeatherLoadingProps {
  /** Texto descriptivo para accesibilidad y visualización */
  message?: string
  /** Subtítulo secundario opcional */
  subtitle?: string
  /** Altura mínima del contenedor ('screen' para página completa o 'card' para módulos) */
  variant?: 'fullscreen' | 'inline' | 'card'
  /** Si debe incluir overlay de fondo */
  withBackdrop?: boolean
}

/**
 * Componente de carga insignia para Finnic con animación de plumas en flotación continua.
 * Usa CSS puro y GPU compositing (sin bloqueo de JS) con estética sobria y premium.
 */
export default function FeatherLoading({
  message = 'Cargando tu espacio…',
  subtitle,
  variant = 'inline',
  withBackdrop = false,
}: FeatherLoadingProps) {
  const containerHeight =
    variant === 'fullscreen'
      ? 'min-h-[100dvh]'
      : variant === 'card'
      ? 'min-h-[260px]'
      : 'py-10 min-h-[180px]'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`relative flex flex-col items-center justify-center select-none w-full ${containerHeight} ${
        withBackdrop ? 'bg-background' : ''
      }`}
    >
      <style>{`
        @keyframes feather-float-1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-14deg) scale(0.96);
          }
          50% {
            transform: translate3d(4px, -12px, 0) rotate(8deg) scale(1.04);
          }
        }
        @keyframes feather-float-2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(18deg) scale(1.02);
          }
          50% {
            transform: translate3d(-6px, -15px, 0) rotate(-10deg) scale(0.94);
          }
        }
        @keyframes feather-float-3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-4deg) scale(0.88);
          }
          50% {
            transform: translate3d(5px, -8px, 0) rotate(12deg) scale(0.98);
          }
        }
        @keyframes feather-glow-pulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.15);
          }
        }
        @keyframes feather-bar-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-feather-1 {
          will-change: transform;
          animation: feather-float-1 3.2s ease-in-out infinite;
        }
        .animate-feather-2 {
          will-change: transform;
          animation: feather-float-2 3.8s ease-in-out 0.4s infinite;
        }
        .animate-feather-3 {
          will-change: transform;
          animation: feather-float-3 2.9s ease-in-out 0.9s infinite;
        }
        .animate-glow-pulse {
          will-change: opacity, transform;
          animation: feather-glow-pulse 3.5s ease-in-out infinite;
        }
        .animate-bar-shimmer {
          animation: feather-bar-shimmer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Escena central de plumas flotantes */}
      <div className="relative flex items-center justify-center h-28 w-28">
        {/* Halo luminoso orgánico de fondo */}
        <div className="animate-glow-pulse pointer-events-none absolute h-24 w-24 rounded-full bg-radial from-[#407E8C]/25 via-[#A58D66]/15 to-transparent blur-xl dark:from-[#4BE3B5]/20 dark:via-[#A58D66]/15" />

        {/* Pluma izquierda (feather-04) */}
        <div className="animate-feather-1 absolute -left-1 top-2 w-11 filter dark:brightness-125 dark:invert opacity-75">
          <img
            src="/brand/feathers/feather-04.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>

        {/* Pluma derecha en contrapunto (feather-07) */}
        <div className="animate-feather-2 absolute -right-1 top-3 w-12 filter dark:brightness-125 dark:invert opacity-80">
          <img
            src="/brand/feathers/feather-07.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>

        {/* Pluma central dorada / principal flotando suavemente (feather-01) */}
        <div className="animate-feather-3 relative z-10 w-14 drop-shadow-[0_8px_16px_rgba(8,58,79,0.18)] dark:drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] filter dark:brightness-125 dark:invert">
          <img
            src="/brand/feathers/feather-01.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Texto de estado con tipografía sobria */}
      <div className="mt-4 flex flex-col items-center text-center px-4">
        <p className="text-sm font-semibold tracking-tight text-foreground/90">
          {message}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {subtitle}
          </p>
        )}
      </div>

      {/* Barra de progreso sutil y minimalista */}
      <div className="mt-4 h-1 w-24 overflow-hidden rounded-full bg-border/50">
        <div className="animate-bar-shimmer h-full w-full rounded-full bg-gradient-to-r from-transparent via-[#407E8C] to-transparent dark:via-[#C0D5D6]" />
      </div>
    </div>
  )
}
