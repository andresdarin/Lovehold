'use client'

import React from 'react'

interface DashboardGreetingProps {
  displayName: string | null
  email?: string
}

/**
 * Saludo y Chip de Hogar adaptados a la zona Hero negativa de Finnic.
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Saludo & Período */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
            {capitalizedMonth} {currentYear}
          </span>
        </div>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-[#F5F2EE] sm:text-3xl">
          {greeting}, {firstName}
        </h1>
      </div>

      {/* Household status pill (Estética translúcida adaptada) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.07] px-3.5 py-1.5 shadow-xs backdrop-blur-md transition-all">
          <span className="h-2 w-2 rounded-full bg-[#4BE3B5] shadow-[0_0_6px_rgba(75,227,181,0.5)]" />
          <span className="text-xs font-semibold text-[#E5E1DD]">
            Finnic Hogar
          </span>
          <span className="rounded-full border border-[#A58D66]/35 bg-[#A58D66]/20 px-2 py-0.5 text-[10px] font-bold text-[#EADDC9]">
            Pendiente Ale
          </span>
        </div>
      </div>
    </div>
  )
}
