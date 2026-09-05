'use client'

import React, { useEffect } from 'react'
import { Home } from 'lucide-react'
import FinnicErrorCard from '@/components/ui/FinnicErrorCard'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Página de error global unificada para Finnic.
 * Mantiene la estética premium con la mascota ilustrada, plumas flotantes y jerarquía clara.
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Finnic Application Error:', error)
  }, [error])

  return (
    <FinnicErrorCard
      eyebrow="Algo no salió como esperábamos"
      title="Tuvimos un inconveniente"
      description="No te preocupes, la información de tus finanzas está a salvo. Podés intentar recargar la vista o volver a tu panel principal."
      digest={error?.digest}
      onRetry={() => reset()}
      retryLabel="Reintentar"
      secondaryAction={{
        label: 'Ir al inicio',
        href: '/dashboard',
        icon: <Home className="h-4 w-4 stroke-[2] text-muted-foreground" />,
      }}
    />
  )
}
