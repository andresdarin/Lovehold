'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp, ScanLine } from 'lucide-react'
import IncomeFormModal from '@/features/personal-finance/IncomeFormModal'

/**
 * Fila de acciones rápidas para pantallas móviles en el contenido del Dashboard.
 * Refleja el modelo financiero:
 * 1. Ingreso (tipo de movimiento)
 * 2. Egreso (tipo de movimiento principal)
 * 3. Escanear ticket (método rápido de carga como apoyo)
 */
export default function DashboardQuickActions() {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)

  return (
    <>
      <section className="flex items-center gap-2.5 sm:hidden" aria-label="Acciones rápidas">
        {/* 1. Ingreso (Secundario / Surface clara con texto Navy y borde sutil) */}
        <button
          type="button"
          onClick={() => setIsIncomeModalOpen(true)}
          className="neu-interactive flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/50 py-3.5 px-3.5 text-sm font-semibold text-primary text-center"
        >
          <ArrowDown className="h-4 w-4 stroke-[2.5] text-primary" />
          <span>Ingreso</span>
        </button>

        {/* 2. Egreso (Principal / Navy #083A4F con texto claro) */}
        <Link
          href="/expenses/new"
          className="neu-interactive flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-3.5 text-sm font-bold text-primary-foreground text-center"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
          <span>Egreso</span>
        </Link>

        {/* 3. Escanear ticket (Icono de apoyo compacto / Teal con fondo sutil -> Abre cámara directa) */}
        <Link
          href="/expenses/new?scan=camera"
          aria-label="Escanear ticket"
          title="Escanear ticket con cámara"
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-[#407E8C]/30 bg-[#407E8C]/10 text-[#407E8C] dark:text-[#C0D5D6] shadow-xs transition-all hover:bg-[#407E8C]/20 hover:border-[#407E8C]/50 active:scale-95"
        >
          <ScanLine className="h-5 w-5 stroke-[2.2]" />
        </Link>
      </section>

      {/* Modal de Registro de Ingreso */}
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />
    </>
  )
}
