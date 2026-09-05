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
  /** Si se renderiza sobre superficies oscuras/negativas como el Hero para forzar contraste alto */
  inverted?: boolean
  /** Clases CSS adicionales */
  className?: string
}

/**
 * Componente de carga insignia para Finnic con animación de plumas en flotación continua.
 * Soporta variantes regulares (fondo claro) e invertidas (fondo Navy profundo).
 * Cumple con contraste de alta legibilidad y compositing GPU sin bloqueo de JS.
 */
export default function FeatherLoading({
  message = 'Cargando tu espacio…',
  subtitle,
  variant = 'inline',
  withBackdrop = false,
  inverted = false,
  className = '',
}: FeatherLoadingProps) {
  const containerHeight =
    variant === 'fullscreen'
      ? 'min-h-[100dvh]'
      : variant === 'card'
      ? 'min-h-[220px] sm:min-h-[260px]'
      : 'py-8 min-h-[160px]'

  const featherFilter = inverted
    ? 'brightness-125 invert opacity-90'
    : 'filter dark:brightness-125 dark:invert opacity-80'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`relative flex flex-col items-center justify-center select-none w-full min-w-0 ${containerHeight} ${
        withBackdrop ? 'bg-background' : ''
      } ${className}`}
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
      <div className="relative flex items-center justify-center h-24 w-24 sm:h-28 sm:w-28">
        {/* Halo luminoso orgánico de fondo */}
        <div
          className={`animate-glow-pulse pointer-events-none absolute h-24 w-24 rounded-full blur-xl ${
            inverted
              ? 'bg-radial from-[#407E8C]/40 via-[#A58D66]/25 to-transparent'
              : 'bg-radial from-[#407E8C]/25 via-[#A58D66]/15 to-transparent dark:from-[#4BE3B5]/20 dark:via-[#A58D66]/15'
          }`}
        />

        {/* Pluma izquierda (feather-04) */}
        <div className={`animate-feather-1 absolute -left-1 top-2 w-10 sm:w-11 ${featherFilter}`}>
          <img
            src="/brand/feathers/feather-04.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>

        {/* Pluma derecha en contrapunto (feather-07) */}
        <div className={`animate-feather-2 absolute -right-1 top-3 w-11 sm:w-12 ${featherFilter}`}>
          <img
            src="/brand/feathers/feather-07.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>

        {/* Pluma central dorada / principal flotando suavemente (feather-01) */}
        <div
          className={`animate-feather-3 relative z-10 w-12 sm:w-14 ${
            inverted
              ? 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] brightness-125 invert'
              : 'drop-shadow-[0_8px_16px_rgba(8,58,79,0.18)] filter dark:brightness-125 dark:invert dark:drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]'
          }`}
        >
          <img
            src="/brand/feathers/feather-01.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Texto de estado con tipografía sobria y contraste garantizado */}
      <div className="mt-3 sm:mt-4 flex flex-col items-center text-center px-4 max-w-sm">
        <p
          className={`text-xs sm:text-sm font-semibold tracking-tight ${
            inverted ? 'text-[#F5F2EE]' : 'text-foreground/90'
          }`}
        >
          {message}
        </p>
        {subtitle && (
          <p
            className={`mt-1 text-xs max-w-xs ${
              inverted ? 'text-[#C0D5D6]' : 'text-muted-foreground'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Barra de progreso sutil y minimalista */}
      <div
        className={`mt-3 sm:mt-4 h-1 w-20 sm:w-24 overflow-hidden rounded-full ${
          inverted ? 'bg-white/15' : 'bg-border/60'
        }`}
      >
        <div
          className={`animate-bar-shimmer h-full w-full rounded-full bg-gradient-to-r from-transparent ${
            inverted ? 'via-[#C0D5D6]' : 'via-[#407E8C] dark:via-[#C0D5D6]'
          } to-transparent`}
        />
      </div>
    </div>
  )
}
