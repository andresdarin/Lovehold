'use client'

import React from 'react'
import { useDashboardData } from '../DashboardData'
import FeatherLoading from '@/components/ui/FeatherLoading'

interface DashboardDataStateProps {
  /** Indica si el contenedor se renderiza sobre superficies invertidas/oscuras como el Hero */
  inverted?: boolean
}

/**
 * Renderizador de estados de carga y error para módulos del Dashboard.
 * Adapta dinámicamente contraste y colores si se ubica en el Hero oscuro o en tarjetas claras.
 */
export default function DashboardDataState({ inverted = false }: DashboardDataStateProps) {
  const { loading, error, refetch } = useDashboardData()

  if (loading) {
    return (
      <div className="py-4 sm:py-6 w-full min-w-0">
        <FeatherLoading
          variant="card"
          message="Cargando tus movimientos…"
          inverted={inverted}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className={`py-5 text-sm ${inverted ? 'text-[#F5F2EE]' : 'text-foreground'}`}
      >
        <p className="font-medium">No pudimos cargar los movimientos.</p>
        <button
          onClick={refetch}
          className={`mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 ${
            inverted
              ? 'text-[#C0D5D6] hover:text-[#F5F2EE]'
              : 'text-primary hover:text-primary-hover'
          }`}
        >
          Volver a cargar
        </button>
      </div>
    )
  }

  return null
}
