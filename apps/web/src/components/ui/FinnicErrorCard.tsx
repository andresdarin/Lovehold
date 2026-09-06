'use client'

import React from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import BannerFeatherPattern from './BannerFeatherPattern'

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
 * Pantalla y tarjeta de error minimalista para Finnic.
 * Diseño sobrio, centrado vertical y horizontalmente, sin elementos superfluos.
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
    <main className="relative z-10 my-auto flex w-full max-w-[390px] flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface/85 p-6 sm:p-7 shadow-xl shadow-[#083A4F]/5 backdrop-blur-xl text-center select-none">
      {/* Mascota Búho en escala minimalista y centrada */}
      <div className="relative mb-2 flex items-center justify-center">
        <img
          src="/brand/finnic-mascot-lost.png"
          alt="Finnic buscando conexión"
          className="h-24 w-24 sm:h-28 sm:w-28 object-contain drop-shadow-sm select-none pointer-events-none"
        />
      </div>

      {/* Pill de estado sutil */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-soft/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-[#A58D66]" />
        <span>{eyebrow}</span>
      </div>

      {/* Título conciso */}
      <h1 className="mt-2.5 text-lg sm:text-xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      {/* Mensaje descriptivo */}
      <p className="mt-1.5 max-w-[300px] text-xs sm:text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Referencia técnica si existe */}
      {digest && (
        <div className="mt-2.5 rounded-md border border-border/40 bg-surface-soft/50 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          Ref: {digest.slice(0, 16)}
        </div>
      )}

      {/* Acciones compactas */}
      <div className="mt-5 flex w-full flex-col sm:flex-row gap-2 sm:gap-2.5">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#083A4F] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#F5F2EE] shadow-xs transition-all hover:bg-[#0B465D] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-[#407E8C] dark:hover:bg-[#356975]"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[2.2] transition-transform group-hover:-rotate-45" />
            <span>{retryLabel}</span>
          </button>
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Link
              href={secondaryAction.href}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground transition-all hover:bg-surface-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground transition-all hover:bg-surface-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )
        )}
      </div>
    </main>
  )

  if (variant === 'contained') {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-130px-env(safe-area-inset-bottom))] w-full items-center justify-center px-4 py-6">
        {cardContent}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#F5F2EE] p-4 text-foreground transition-colors duration-500 select-none sm:p-6 dark:bg-[#071D27]">
      {/* Fondo de plumas estáticas orgánicas */}
      <BannerFeatherPattern />

      {/* Luces sutiles de fondo */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#407E8C]/10 blur-3xl dark:bg-[#407E8C]/15" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-[#A58D66]/10 blur-3xl dark:bg-[#A58D66]/5" />

      {cardContent}
    </div>
  )
}
