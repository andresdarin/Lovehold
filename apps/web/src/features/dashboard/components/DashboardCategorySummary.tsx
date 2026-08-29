'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, UtensilsCrossed, Fuel, Sparkles } from 'lucide-react'

interface CategoryRowProps {
  icon: React.ElementType
  iconBgClass: string
  iconColorClass: string
  name: string
  amount: string
  percentage: number
  colorClass: string
}

function CategoryRow({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  name,
  amount,
  percentage,
  colorClass,
}: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBgClass} ${iconColorClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>{name}</span>
          <span className="tabular-nums">{amount}</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
          <div
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Top Categorías del mes en la sección clara del Dashboard.
 */
export default function DashboardCategorySummary() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cat-super-bg text-cat-super">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Top categorías del mes</h2>
            <p className="text-xs text-muted-foreground">Distribución del gasto</p>
          </div>
        </div>
        <Link
          href="/expenses"
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <CategoryRow
          icon={ShoppingBag}
          iconBgClass="bg-cat-super-bg"
          iconColorClass="text-cat-super"
          name="Supermercado"
          amount="$0"
          percentage={0}
          colorClass="bg-cat-super"
        />
        <CategoryRow
          icon={UtensilsCrossed}
          iconBgClass="bg-cat-delivery-bg"
          iconColorClass="text-cat-delivery"
          name="Delivery"
          amount="$0"
          percentage={0}
          colorClass="bg-cat-delivery"
        />
        <CategoryRow
          icon={Fuel}
          iconBgClass="bg-cat-fuel-bg"
          iconColorClass="text-cat-fuel"
          name="Combustible"
          amount="$0"
          percentage={0}
          colorClass="bg-cat-fuel"
        />
        <CategoryRow
          icon={Sparkles}
          iconBgClass="bg-cat-hygiene-bg"
          iconColorClass="text-cat-hygiene"
          name="Higiene"
          amount="$0"
          percentage={0}
          colorClass="bg-cat-hygiene"
        />
      </div>
    </div>
  )
}
