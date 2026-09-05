'use client'

import React, { useEffect } from 'react'
import { Home } from 'lucide-react'
import FinnicErrorCard from '@/components/ui/FinnicErrorCard'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary para las rutas protegidas dentro de la aplicación.
 * Mantiene la estética insignia con la ilustración del búho y plumas orgánicas.
 */
export default function AuthenticatedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Authenticated Section Error:', error)
  }, [error])

  return (
    <FinnicErrorCard
      variant="contained"
      eyebrow="Error en esta sección"
      title="No pudimos cargar esta pantalla"
      description="Ocurrió un error inesperado al procesar la información. Podés volver a intentarlo sin perder tu sesión."
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
