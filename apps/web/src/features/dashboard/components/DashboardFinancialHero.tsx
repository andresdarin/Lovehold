'use client'

import React from 'react'

interface StatMetricProps {
  label: string
  value: string
  dotColor: string
  highlighted?: boolean
}

function StatMetric({ label, value, dotColor, highlighted = false }: StatMetricProps) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl p-2.5 sm:p-3 transition-all ${
        highlighted
          ? 'bg-white/[0.08] border border-white/[0.18] shadow-[0_4px_16px_rgba(0,0,0,0.15)] ring-1 ring-white/[0.08]'
          : 'bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] sm:text-[11px] font-medium truncate ${
            highlighted ? 'text-[#F5F2EE] font-semibold' : 'text-[#C0D5D6]/70'
          }`}
        >
          {label}
        </span>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
      </div>
      <span
        className={`text-base sm:text-lg md:text-xl font-bold tracking-tight tabular-nums truncate ${
          highlighted ? 'text-[#F5F2EE]' : 'text-[#F5F2EE]/90'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Hero Financiero Principal: Jerarquía directa, tipografía protagonista y métricas esenciales.
 */
export default function DashboardFinancialHero() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 pt-1">
      {/* Monto Principal Dual (Pesos + Dólares) & Ahorro Secundario */}
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C0D5D6]/70">
          Gasto total del mes
        </span>

        {/* Cifras en Pesos y Dólares */}
        <div className="mt-1 flex items-baseline justify-center gap-3 sm:gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-[#F5F2EE] sm:text-4xl tabular-nums">
              $0
            </span>
            <span className="text-xs font-semibold text-[#C0D5D6]/70">UYU</span>
          </div>
          <span className="text-lg text-white/20 font-light">|</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-[#F5F2EE]/90 sm:text-3xl tabular-nums">
              US$ 0
            </span>
          </div>
        </div>

        {/* Fila inferior de apoyo: Estado 'Al día' + Ahorro secundario */}
        <div className="mt-2 flex items-center justify-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#208B6B]/25 bg-[#208B6B]/10 px-2 py-0.5 text-[10px] font-semibold text-[#4BE3B5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4BE3B5] shadow-[0_0_4px_rgba(75,227,181,0.8)]" />
            <span>Al día</span>
          </div>

          <span className="text-[10px] text-white/20">•</span>

          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C0D5D6]/80">
            <span className="text-[#A58D66]">Ahorro:</span>
            <span className="font-bold text-[#F5F2EE] tabular-nums">$0</span>
          </div>
        </div>
      </div>

      {/* 3 KPIs en una sola fila: Balance actual resaltado + Top 2 Categorías */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-3.5 sm:gap-3">
        <StatMetric
          label="Balance actual"
          value="$0"
          dotColor="bg-[#4BE3B5] shadow-[0_0_6px_rgba(75,227,181,0.6)]"
          highlighted
        />
        <StatMetric
          label="Supermercado"
          value="$0"
          dotColor="bg-[#48B89F] shadow-[0_0_6px_rgba(72,184,159,0.6)]"
        />
        <StatMetric
          label="Delivery"
          value="$0"
          dotColor="bg-[#72B1BE] shadow-[0_0_6px_rgba(114,177,190,0.6)]"
        />
      </div>
    </div>
  )
}
