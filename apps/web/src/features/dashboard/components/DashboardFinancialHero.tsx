'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'

interface MetricItemProps {
  label: string
  value: string
  subtitle: string
  accentColor: string
}

function MetricItem({ label, value, subtitle, accentColor }: MetricItemProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5 backdrop-blur-xs transition-colors hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#C0D5D6]/80">{label}</span>
        <span className={`h-2 w-2 rounded-full ${accentColor}`} />
      </div>
      <span className="text-xl font-bold tracking-tight text-[#F5F2EE] tabular-nums">
        {value}
      </span>
      <span className="text-[11px] text-[#E5E1DD]/60">{subtitle}</span>
    </div>
  )
}

/**
 * Hero Financiero Principal integrado en la zona negativa del Home.
 */
export default function DashboardFinancialHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all">
      {/* Decorative ambient aura */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#C0D5D6]/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-[#A58D66]/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
        {/* Main amount & Quick desktop CTA */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C0D5D6]/90">
              Gasto total del mes
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#F5F2EE] sm:text-5xl tabular-nums">
                $0
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#208B6B]/40 bg-[#208B6B]/25 px-2.5 py-0.5 text-xs font-bold text-[#4BE3B5] shadow-xs">
                <TrendingUp className="h-3 w-3" /> Al día
              </span>
            </div>
          </div>

          {/* Quick CTA on Desktop */}
          <div className="hidden sm:flex items-center gap-2 pt-2 sm:pt-0">
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#F5F2EE] px-5 py-3 text-sm font-bold text-[#083A4F] shadow-sm transition-all hover:bg-white active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Agregar gasto
            </Link>
          </div>
        </div>

        {/* Metric Breakdown Strip (Dark elevated cards) */}
        <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-4 sm:gap-3">
          <MetricItem
            label="Balance actual"
            value="$0"
            subtitle="Sin deudas"
            accentColor="bg-[#C0D5D6] shadow-[0_0_6px_rgba(192,213,214,0.5)]"
          />
          <MetricItem
            label="Supermercado"
            value="$0"
            subtitle="0 compras"
            accentColor="bg-[#48B89F] shadow-[0_0_6px_rgba(72,184,159,0.5)]"
          />
          <MetricItem
            label="Nafta / Combustible"
            value="$0"
            subtitle="0 cargas"
            accentColor="bg-[#CCA46D] shadow-[0_0_6px_rgba(204,164,109,0.5)]"
          />
          <MetricItem
            label="Delivery & Comida"
            value="$0"
            subtitle="0 pedidos"
            accentColor="bg-[#72B1BE] shadow-[0_0_6px_rgba(114,177,190,0.5)]"
          />
        </div>
      </div>
    </section>
  )
}
