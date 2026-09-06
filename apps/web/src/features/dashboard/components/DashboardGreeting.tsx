'use client'

import React from 'react'

interface DashboardGreetingProps {
  displayName: string | null
  email?: string
}

/**
 * Saludo y contexto del período con jerarquía tipográfica limpia y minimalista.
 */
export default function DashboardGreeting({ displayName, email }: DashboardGreetingProps) {
  const firstName = displayName?.split(' ')[0] ?? email?.split('@')[0] ?? 'bienvenido'
  const currentMonth = new Intl.DateTimeFormat('es-UY', { month: 'long' }).format(new Date())
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)
  const currentYear = new Date().getFullYear()

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? 'Buen día'
      : currentHour < 19
      ? 'Buenas tardes'
      : 'Buenas noches'

  return (
    <div className="flex flex-col pt-1">
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
        {capitalizedMonth} {currentYear}
      </span>
      <h1 className="type-display mt-0.5 text-[clamp(1.75rem,5vw,2rem)] text-[#F5F2EE]">
        {greeting}, {firstName}
      </h1>
      {/* Separador sutil con desvanecimiento hacia la derecha */}
      <div
        className="mt-2.5 sm:mt-3 h-px w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}
