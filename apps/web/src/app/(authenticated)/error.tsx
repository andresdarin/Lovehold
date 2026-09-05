'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary para las rutas protegidas dentro de la aplicación.
 * Permite reintentar la acción o volver al dashboard sin desloguear al usuario.
 */
export default function AuthenticatedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Authenticated Section Error:', error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-lg flex-col items-center justify-center px-4 py-8 text-center select-none">
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full bg-danger/10 blur-lg" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/80 bg-surface shadow-xs">
          <div className="dark:hidden">
            <FinnicOwlIcon color="navy" className="h-10 w-10" />
          </div>
          <div className="hidden dark:block">
            <FinnicOwlIcon color="aqua" className="h-10 w-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow-xs">
            <AlertCircle className="h-3 w-3 stroke-[2.5]" />
          </div>
        </div>
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
        Error en esta sección
      </span>

      <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        No pudimos cargar esta pantalla
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Ocurrió un error inesperado al procesar la información. Podés volver a
        intentarlo sin perder tu sesión.
      </p>

      {error?.digest && (
        <div className="mt-3 rounded-lg border border-border/50 bg-surface-soft/50 px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
          Ref: {error.digest.slice(0, 16)}
        </div>
      )}

      <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-primary-hover active:scale-95"
        >
          <RotateCcw className="h-4 w-4 stroke-[2.2] transition-transform group-hover:-rotate-45" />
          <span>Reintentar</span>
        </button>

        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-soft active:scale-95"
        >
          <Home className="h-4 w-4 stroke-[2] text-muted-foreground" />
          <span>Inicio</span>
        </Link>
      </div>
    </div>
  )
}
