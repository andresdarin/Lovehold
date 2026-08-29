'use client'

import React from 'react'
import { Landmark, ArrowUpRight, ShoppingBag, CreditCard } from 'lucide-react'
import { formatCurrency } from './constants'
import type { MonthlySummary } from './types'

interface MonthlySummaryCardsProps {
  summary: MonthlySummary
}

export default function MonthlySummaryCards({ summary }: MonthlySummaryCardsProps) {
  const fixedPct = summary.totalExpense > 0 ? (summary.fixed / summary.totalExpense) * 100 : 0
  const variablePct = summary.totalExpense > 0 ? (summary.variable / summary.totalExpense) * 100 : 0
  const superPct = summary.totalExpense > 0 ? (summary.supermarket / summary.totalExpense) * 100 : 0

  return (
    <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
            <Landmark className="h-4 w-4 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Resumen del mes</h2>
            <p className="text-[11px] text-muted-foreground">Desglose de compromisos y egresos</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-foreground tabular-nums">
            {formatCurrency(summary.totalExpense)}
          </span>
          <p className="text-[10px] text-muted-foreground">Total egresos</p>
        </div>
      </div>

      {/* Barra de Proporción General */}
      <div className="mt-4">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/40 gap-0.5">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(fixedPct, 2)}%` }}
            title={`Fijos: ${fixedPct.toFixed(0)}%`}
          />
          <div
            className="h-full bg-[#407E8C] transition-all duration-500"
            style={{ width: `${Math.max(variablePct, 2)}%` }}
            title={`Variables: ${variablePct.toFixed(0)}%`}
          />
          <div
            className="h-full bg-cat-super transition-all duration-500"
            style={{ width: `${Math.max(superPct, 2)}%` }}
            title={`Supermercado: ${superPct.toFixed(0)}%`}
          />
        </div>
      </div>

      {/* Bloques de desglose financiero */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Gastos Fijos */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-surface-soft/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Gastos Fijos</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 text-primary">
              <ArrowUpRight className="h-3 w-3 stroke-[2]" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {formatCurrency(summary.fixed)}
          </span>
        </div>

        {/* Gastos Variables */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-surface-soft/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Variables</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#407E8C]/30 text-[#407E8C]">
              <ArrowUpRight className="h-3 w-3 stroke-[2]" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {formatCurrency(summary.variable)}
          </span>
        </div>

        {/* Supermercado */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-surface-soft/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Supermercado</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cat-super/40 text-cat-super">
              <ShoppingBag className="h-3 w-3 stroke-[2]" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {formatCurrency(summary.supermarket)}
          </span>
        </div>

        {/* Tarjetas / Comprometido */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-surface-soft/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Tarjetas</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#A58D66]/40 text-[#A58D66]">
              <CreditCard className="h-3 w-3 stroke-[2]" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {formatCurrency(summary.creditCommitted)}
          </span>
        </div>
      </div>
    </div>
  )
}
