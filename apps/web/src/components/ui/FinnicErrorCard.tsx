'use client'

import React from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import BannerFeatherPattern from './BannerFeatherPattern'
import FinnicBrand from './FinnicBrand'

interface SecondaryAction {
  label: string
  onClick?: () => void
  href?: string
  icon?: React.ReactNode
}

interface FinnicErrorCardProps {
  /** Texto del tag/eyebrow superior */
  eyebrow?: string
  /** Título principal de la alerta */
  title?: string
  /** Descripción legible y empática */
  description?: string
  /** Etiqueta de referencia técnica (opcional) */
  digest?: string
  /** Callback para reintentar la acción */
  onRetry?: () => void
  /** Texto del botón principal */
  retryLabel?: string
  /** Acción secundaria (cerrar sesión, ir al inicio, etc.) */
  secondaryAction?: SecondaryAction
  /** Modo de visualización: 'fullscreen' para bloqueo completo o 'contained' para secciones internas */
  variant?: 'fullscreen' | 'contained'
}

/**
 * Pantalla y tarjeta de error de alta gama para Finnic.
 * Integra la mascota ilustrada transparente del búho buscando señal, plumas flotantes orgánicas,
 * centrado vertical y horizontal absoluto, y jerarquía visual refinada.
 */
export default function FinnicErrorCard({
  eyebrow = 'No pudimos conectar con tu espacio',
  title = 'Error de conexión',
  description = 'No pudimos comunicarnos con el servidor de Finnic. Comprobá tu conexión a internet o reintentá en unos segundos.',
  digest,
  onRetry,
  retryLabel = 'Reintentar',
  secondaryAction,
  variant = 'fullscreen',
}: FinnicErrorCardProps) {
  const cardContent = (
    <main className="relative z-10 my-auto flex w-full max-w-[440px] flex-col items-center justify-center rounded-3xl border border-border/70 bg-surface/90 p-6 sm:p-8 shadow-2xl shadow-[#083A4F]/5 backdrop-blur-xl text-center select-none">
      <style>{`
        @keyframes error-feather-float-1 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-12deg); }
          50% { transform: translate3d(-6px, -12px, 0) rotate(4deg); }
        }
        @keyframes error-feather-float-2 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(16deg); }
          50% { transform: translate3d(6px, -10px, 0) rotate(-6deg); }
        }
        .animate-error-feather-1 {
          will-change: transform;
          animation: error-feather-float-1 4.5s ease-in-out infinite;
        }
        .animate-error-feather-2 {
          will-change: transform;
          animation: error-feather-float-2 5.2s ease-in-out 0.8s infinite;
        }
      `}</style>

      {/* Escena superior: Mascota Búho transparente buscando señal con plumas flotantes */}
      <div className="relative mb-3 flex items-center justify-center">
        {/* Halo luminoso ambiental cálido */}
        <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-radial from-[#407E8C]/25 via-[#A58D66]/15 to-transparent blur-2xl" />

        {/* Pluma flotante izquierda decorativa */}
        <div className="animate-error-feather-1 pointer-events-none absolute -left-10 top-2 w-10 sm:w-12 opacity-75 filter drop-shadow-md">
          <img
            src="/brand/feathers/feather-04.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>

        {/* Pluma flotante derecha decorativa */}
        <div className="animate-error-feather-2 pointer-events-none absolute -right-10 top-6 w-10 sm:w-12 opacity-75 filter drop-shadow-md">
          <img
            src="/brand/feathers/feather-01.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain pointer-events-none"
          />
        </div>

        {/* Ilustración de la mascota Finnic transparente sin fondo */}
        <img
          src="/brand/finnic-mascot-lost.png"
          alt="Finnic buscando conexión"
          className="relative z-10 h-36 w-36 sm:h-44 sm:w-44 object-contain drop-shadow-[0_12px_24px_rgba(8,58,79,0.18)] select-none pointer-events-none"
        />
      </div>

      {/* Pill de estado minimalista */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#A58D66]/30 bg-[#A58D66]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#A58D66] dark:text-[#BCA47B]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A58D66] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A58D66]" />
        </span>
        <span>{eyebrow}</span>
      </div>

      {/* Título de la alerta */}
      <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      {/* Mensaje descriptivo */}
      <p className="mt-2.5 max-w-sm text-sm sm:text-base leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Referencia técnica colapsable si está disponible */}
      {digest && (
        <div className="mt-3 rounded-lg border border-border/50 bg-surface-soft/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
          Ref: {digest.slice(0, 16)}
        </div>
      )}

      {/* Acciones principales con micro-interacciones */}
      <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#083A4F] px-5 py-3.5 text-sm font-bold text-[#F5F2EE] shadow-md shadow-[#083A4F]/15 transition-all hover:bg-[#0B465D] hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-[#407E8C] dark:hover:bg-[#356975]"
          >
            <RotateCcw className="h-4 w-4 stroke-[2.4] transition-transform group-hover:-rotate-45" />
            <span>{retryLabel}</span>
          </button>
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Link
              href={secondaryAction.href}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-soft hover:border-primary/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-soft hover:border-primary/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )
        )}
      </div>

      {/* Separador e identidad de marca horizontal */}
      <div className="mt-6 pt-5 border-t border-border/50 w-full flex flex-col items-center">
        <FinnicBrand variant="auto" size="sm" className="opacity-75" />
        <p className="mt-1 text-[11px] text-muted-foreground/75">
          Tu copiloto financiero personal y en pareja
        </p>
      </div>
    </main>
  )

  if (variant === 'contained') {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full items-center justify-center px-4 py-8">
        {cardContent}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#F5F2EE] p-4 text-foreground transition-colors duration-500 select-none sm:p-6 dark:bg-[#071D27]">
      {/* Fondo de plumas estáticas orgánicas */}
      <BannerFeatherPattern />

      {/* Luces etéreas de fondo */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#407E8C]/15 blur-3xl dark:bg-[#407E8C]/20" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-[#A58D66]/15 blur-3xl dark:bg-[#A58D66]/10" />

      {cardContent}
    </div>
  )
}
