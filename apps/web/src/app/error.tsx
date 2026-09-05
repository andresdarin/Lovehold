'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'
import BannerFeatherPattern from '@/components/ui/BannerFeatherPattern'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Página de error unificada y estilizada para Finnic.
 * Mantiene la estética premium Navy + Sand + Gold, con soporte para dark mode,
 * safe areas, feedback visual claro y acciones de recuperación elegantes.
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log interno del error sin bloquear la experiencia de usuario
    console.error('Finnic Application Error:', error)
  }, [error])

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#F5F2EE] px-4 py-8 text-foreground transition-colors duration-500 select-none sm:px-6 dark:bg-[#071D27]">
      {/* 1. Fondo de plumas estáticas sutiles */}
      <BannerFeatherPattern />

      {/* 2. Luces de ambiente sutiles en los bordes */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#407E8C]/15 blur-3xl dark:bg-[#407E8C]/20" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-[#A58D66]/15 blur-3xl dark:bg-[#A58D66]/10" />

      {/* 3. Contenedor Card Flotante Monolítico en cristal cálido */}
      <main className="relative z-10 mx-auto flex w-full max-w-[460px] flex-col items-center rounded-3xl border border-border/80 bg-surface/90 p-7 sm:p-9 shadow-xl shadow-black/5 backdrop-blur-md text-center">
        {/* Búho Finnic con aureola de estado */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-danger/10 blur-xl dark:bg-danger/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-soft border border-border/80 shadow-xs">
            <div className="dark:hidden">
              <FinnicOwlIcon color="navy" className="h-12 w-12" />
            </div>
            <div className="hidden dark:block">
              <FinnicOwlIcon color="aqua" className="h-12 w-12" />
            </div>
            {/* Pequeño badge de alerta */}
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow-xs">
              <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Tag / Eyebrow */}
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
          Algo no salió como esperábamos
        </span>

        {/* Título */}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl dark:text-foreground">
          Tuvimos un inconveniente
        </h1>

        {/* Descripción clara y amigable */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No te preocupes, la información de tus finanzas está a salvo. Podés
          intentar recargar la vista o volver a tu panel principal.
        </p>

        {/* Código o detalle técnico colapsable / sutil si existe digest */}
        {error?.digest && (
          <div className="mt-4 rounded-xl border border-border/60 bg-surface-soft/60 px-3 py-1.5 text-[11px] font-mono text-muted-foreground">
            Ref: {error.digest.slice(0, 16)}
          </div>
        )}

        {/* Acciones principales */}
        <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
          {/* Botón Reintentar */}
          <button
            type="button"
            onClick={() => reset()}
            className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#083A4F] px-5 py-3.5 text-sm font-semibold text-[#F5F2EE] shadow-md shadow-[#083A4F]/15 transition-all hover:bg-[#0B465D] hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-[#407E8C] dark:hover:bg-[#356975]"
          >
            <RotateCcw className="h-4 w-4 stroke-[2.2] transition-transform group-hover:-rotate-45" />
            <span>Reintentar</span>
          </button>

          {/* Botón Volver al Inicio */}
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-soft hover:border-primary/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Home className="h-4 w-4 stroke-[2] text-muted-foreground" />
            <span>Ir al inicio</span>
          </Link>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="relative z-10 mt-6 text-xs text-muted-foreground/80">
        Finnic · Tu copiloto financiero personal y en pareja
      </footer>
    </div>
  )
}
