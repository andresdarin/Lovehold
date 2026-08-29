'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'

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
      {/* Monto Principal & CTA */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C0D5D6]/75">
            Gasto total del mes
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight text-[#F5F2EE] sm:text-5xl tabular-nums">
              $0
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#208B6B]/30 bg-[#208B6B]/20 px-2.5 py-0.5 text-xs font-semibold text-[#4BE3B5]">
              <TrendingUp className="h-3 w-3 stroke-[2.5]" /> Al día
            </span>
          </div>
        </div>

        {/* Quick CTA en Desktop */}
        <div className="hidden sm:flex items-center">
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#F5F2EE] px-4 py-2.5 text-xs font-bold text-[#083A4F] shadow-xs transition-all hover:bg-white active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            Agregar gasto
          </Link>
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
