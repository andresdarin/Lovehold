'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Circle,
  HelpCircle,
  Receipt,
  ScanLine,
  Sparkle,
  Sparkles,
  UtensilsCrossed,
  Fuel
} from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'

/**
 * Dashboard principal de Lovehold.
 * Estética fintech moderna, minimalista y amigable con soporte nativo de Light y Dark themes.
 */
export default function DashboardPage() {
  const { profile } = useProfile()
  const [showHelper, setShowHelper] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)

  const firstName = profile?.displayName?.split(' ')[0] ?? profile?.email?.split('@')[0]
  const currentMonth = new Intl.DateTimeFormat('es-UY', { month: 'long' }).format(new Date())
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? 'Buen día'
      : currentHour < 19
      ? 'Buenas tardes'
      : 'Buenas noches'

  return (
    <div className="flex flex-col gap-6 pb-12 sm:pb-6">
      {/* 1. Saludo & Status */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {capitalizedMonth} {new Date().getFullYear()}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {firstName ?? 'bienvenido'}
          </h1>
        </div>

        {/* Household status pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-foreground">
              Hogar Lovehold
            </span>
            <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              Pendiente Ale
            </span>
          </div>
        </div>
      </header>

      {/* 2. Resumen Financiero Hero (Alta Prominencia) */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs transition-all">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gasto total del mes
              </span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl tabular-nums">
                  $0
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                  <TrendingUp className="h-3 w-3" /> Al día
                </span>
              </div>
            </div>

            {/* Quick CTAs on Desktop */}
            <div className="hidden sm:flex items-center gap-2 pt-2 sm:pt-0">
              <Link
                href="/expenses/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Agregar gasto
              </Link>
            </div>
          </div>

          {/* Metric Breakdown Strip */}
          <div className="grid grid-cols-2 gap-3 border-t border-border/70 pt-5 sm:grid-cols-4">
            <MetricItem
              label="Balance actual"
              value="$0"
              subtitle="Sin deudas"
              badgeColor="text-primary bg-primary/10"
            />
            <MetricItem
              label="Supermercado"
              value="$0"
              subtitle="0 compras"
              badgeColor="text-cat-super bg-cat-super-bg"
            />
            <MetricItem
              label="Nafta / Combustible"
              value="$0"
              subtitle="0 cargas"
              badgeColor="text-cat-fuel bg-cat-fuel-bg"
            />
            <MetricItem
              label="Delivery & Comida"
              value="$0"
              subtitle="0 pedidos"
              badgeColor="text-cat-delivery bg-cat-delivery-bg"
            />
          </div>
        </div>
      </section>

      {/* 3. Acciones Rápidas (Mobile CTA row) */}
      <section className="grid grid-cols-2 gap-3 sm:hidden">
        <Link
          href="/expenses/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-sm font-bold text-primary-foreground shadow-xs transition-all active:scale-95 text-center"
        >
          <Plus className="h-4 w-4" />
          Agregar gasto
        </Link>
        <Link
          href="/expenses/new"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 px-4 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-surface-soft active:scale-95 text-center"
        >
          <ScanLine className="h-4 w-4 text-muted-foreground" />
          Escanear ticket
        </Link>
      </section>

      {/* 4. Categorías & Gastos Relevantes */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Top Categorías */}
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

        {/* Últimos Movimientos */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Últimos movimientos</h2>
                  <p className="text-xs text-muted-foreground">Gastos recientes de la pareja</p>
                </div>
              </div>
              <Link
                href="/expenses"
                className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Ver historial
              </Link>
            </div>

            {/* Empty state minimal */}
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-muted-foreground">
                <Receipt className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Todavía no hay gastos este mes</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                Registren su primera compra para ver el detalle y balance automático acá.
              </p>
            </div>
          </div>

          <Link
            href="/expenses/new"
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft py-2.5 text-xs font-bold text-foreground hover:bg-surface-alt transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-primary" /> Registrar movimiento
          </Link>
        </div>
      </section>

      {/* 5. Onboarding / Helper Secundario (Compacto & Cerrable) */}
      {showOnboarding && (
        <section className="rounded-3xl border border-border bg-surface-soft/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Primeros pasos (1 de 4)
              </h3>
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              Ocultar
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full w-1/4 rounded-full bg-primary transition-all duration-500" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StepBadge label="Cuenta creada" done />
            <StepBadge label="Crear Lovehold" done={false} />
            <StepBadge label="Invitar a Ale" done={false} />
            <StepBadge label="Primer gasto" done={false} />
          </div>
        </section>
      )}

      {/* Help tooltip toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span>¿Cómo divide Lovehold los gastos?</span>
        </div>
        <button
          onClick={() => setShowHelper((v) => !v)}
          className="font-bold text-primary hover:underline"
        >
          {showHelper ? 'Ocultar' : 'Ver explicación'}
        </button>
      </div>

      {showHelper && (
        <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
          <p className="font-semibold text-foreground mb-1">Cálculo automático 50/50</p>
          Cuando uno de los dos registra un gasto compartido, Lovehold calcula automáticamente cuánto le corresponde a cada uno y actualiza el saldo neto en tiempo real sin cálculos manuales.
        </div>
      )}
    </div>
  )
}

/* ── Componentes de Soporte ── */

function MetricItem({
  label,
  value,
  subtitle,
  badgeColor,
}: {
  label: string
  value: string
  subtitle: string
  badgeColor: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-surface-soft/40 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`h-2 w-2 rounded-full ${badgeColor.split(' ')[0]?.replace('text-', 'bg-') || 'bg-primary'}`} />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground">{subtitle}</span>
    </div>
  )
}

function CategoryRow({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  name,
  amount,
  percentage,
  colorClass,
}: {
  icon: React.ElementType
  iconBgClass: string
  iconColorClass: string
  name: string
  amount: string
  percentage: number
  colorClass: string
}) {
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

function StepBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold ${
      done
        ? 'border-success/30 bg-success/5 text-success'
        : 'border-border bg-surface text-muted-foreground'
    }`}>
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </div>
  )
}
