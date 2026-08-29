'use client'

import React from 'react'
import { useProfile } from '@/features/auth/ProfileProvider'
import DashboardHero from '@/features/dashboard/components/DashboardHero'
import DashboardQuickActions from '@/features/dashboard/components/DashboardQuickActions'
import DashboardCategorySummary from '@/features/dashboard/components/DashboardCategorySummary'
import DashboardRecentMovements from '@/features/dashboard/components/DashboardRecentMovements'
import DashboardOnboarding from '@/features/dashboard/components/DashboardOnboarding'

/**
 * Dashboard principal de Finnic.
 * Estructura con Hero superior negativo (full-bleed) y cuerpo claro modular.
 */
export default function DashboardPage() {
  const { profile } = useProfile()

  return (
    <div className="flex flex-col gap-6 pb-12 sm:pb-6">
      {/* 1. Franja Superior / Hero Negativo Full-Bleed */}
      <DashboardHero profile={profile} />

      {/* 2. Cuerpo del Dashboard (Fondo Claro Sand / Contenido principal) */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 flex flex-col gap-6">
        {/* Acciones Rápidas (Mobile) */}
        <DashboardQuickActions />

        {/* Categorías & Movimientos */}
        <section className="grid gap-6 md:grid-cols-2">
          <DashboardCategorySummary />
          <DashboardRecentMovements />
        </section>

        {/* Onboarding & Ayuda */}
        <DashboardOnboarding />
      </div>
    </div>
  )
}
