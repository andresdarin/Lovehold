'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, UtensilsCrossed, Fuel, Sparkles } from 'lucide-react'

interface CategoryRowProps {
  icon: React.ElementType
  name: string
  amount: string
  percentage: number
  colorClass: string
  borderClass: string
}

function CategoryRow({
  icon: Icon,
  name,
  amount,
  percentage,
  colorClass,
  borderClass,
}: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      {/* Icono circular solo con outline de su propio color */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${borderClass} ${colorClass} bg-transparent`}
      >
        <Icon className="h-3.5 w-3.5 stroke-[2]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>{name}</span>
          <span className="tabular-nums font-bold text-foreground/90">{amount}</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border/40">
          <div
            className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Top Categorías del mes en la sección clara del Dashboard.
 * Diseño minimalista con iconos circulares con outline de su propio color.
 */
export default function DashboardCategorySummary() {
  return (
    <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cat-super/40 text-cat-super bg-transparent">
            <ShoppingBag className="h-4 w-4 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Top categorías del mes</h2>
            <p className="text-[11px] text-muted-foreground">Distribución del gasto</p>
          </div>
        </div>
        <Link
          href="/expenses"
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-3.5 space-y-2">
        <CategoryRow
          icon={ShoppingBag}
          name="Supermercado"
          amount="$0"
          percentage={0}
          colorClass="text-cat-super"
          borderClass="border-cat-super/40"
        />
        <CategoryRow
          icon={UtensilsCrossed}
          name="Delivery"
          amount="$0"
          percentage={0}
          colorClass="text-cat-delivery"
          borderClass="border-cat-delivery/40"
        />
        <CategoryRow
          icon={Fuel}
          name="Combustible"
          amount="$0"
          percentage={0}
          colorClass="text-cat-fuel"
          borderClass="border-cat-fuel/40"
        />
        <CategoryRow
          icon={Sparkles}
          name="Higiene"
          amount="$0"
          percentage={0}
          colorClass="text-cat-hygiene"
          borderClass="border-cat-hygiene/40"
        />
      </div>
    </div>
  )
}
