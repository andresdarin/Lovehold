'use client'

import Link from 'next/link'
import React from 'react'
import { Check, Circle, Coffee, Heart, Home, Plus, QrCode, Repeat, Search, ShoppingBasket, TrendingUp, Wallet } from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'
import LiquidGlass from '@/components/ui/LiquidGlass'

/**
 * Dashboard principal de Lovehold.
 * Consume los datos del perfil desde el ProfileProvider y los renderiza con variables de diseño semánticas.
 */
export default function DashboardPage() {
  const { profile } = useProfile()

  const firstName = profile?.displayName?.split(' ')[0]
  const greetingTime = new Date().getHours() < 12 ? 'Buen día' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {firstName ? `${greetingTime}, ${firstName}` : greetingTime}
            </h1>
            <p className="text-sm text-muted-foreground">Todavía no creaste tu Lovehold con Ale.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LiquidGlass variant="button" intensity="medium" className="inline-flex">
            <Link
              href="/expenses/new"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-foreground disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 text-primary" />
              Agregar gasto
            </Link>
          </LiquidGlass>
        </div>
      </header>

      {/* ═══ PROFILE CARD ═══ */}
      <section className="rounded-[20px] border border-white/[0.08] bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-inner overflow-hidden ring-1 ring-white/10 shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${profile?.color ?? '#FF6B6B'}ee, ${profile?.color ?? '#FF6B6B'})` 
            }}
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName ?? 'Foto de perfil'}
                className="h-full w-full rounded-xl object-cover block shrink-0"
              />
            ) : (
              <span className="drop-shadow-sm text-lg font-bold">{(profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {profile?.displayName ?? 'Completá tu perfil'}
            </p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <p className="mt-2 inline-flex rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
              Pendiente de vincular con Ale
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground">Miembro desde</p>
            <p className="text-sm text-foreground/80">
              {memberSince}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ EMPTY LOVEHOLD STATE ═══ */}
      <LiquidGlass variant="card" intensity="subtle" className="p-6 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Creá tu Lovehold</h2>
          <p className="max-w-xl text-sm font-medium leading-6 text-muted-foreground">
            Invitá a Ale y empiecen a llevar sus gastos compartidos, balances y metas del mes en un solo lugar.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Gastos compartidos', 'Balance automático', 'Métricas mensuales'].map((benefit) => (
              <span
                key={benefit}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground/80"
              >
                {benefit}
              </span>
            ))}
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            <LiquidGlass variant="button" intensity="medium" disabled className="inline-flex">
              <button
                disabled
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed"
              >
                <Home className="h-4 w-4 text-primary" />
                Crear hogar
              </button>
            </LiquidGlass>
            <button
              disabled
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-surface-soft hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-not-allowed"
            >
              <QrCode className="h-4 w-4" />
              Unirme con código
            </button>
          </div>
        </div>
      </LiquidGlass>

      {/* ═══ METRIC CARDS ═══ */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Wallet} label="Gasto total del mes" value="$0" description="Todavía no registraron gastos" colorClass="text-primary bg-primary/10" dotClass="bg-primary" />
        <MetricCard icon={TrendingUp} label="Balance actual" value="$0" description="Sin deudas entre ustedes" colorClass="text-accent bg-accent/10" dotClass="bg-accent" glassBadge />
        <MetricCard icon={Repeat} label="Nafta este mes" value="$0" description="Primer módulo sugerido" colorClass="text-gold bg-gold/10" dotClass="bg-gold" />
        <MetricCard icon={Coffee} label="Delivery este mes" value="$0" description="Ideal para pedidos compartidos" colorClass="text-primary bg-primary/10" dotClass="bg-primary/50" />
      </section>

      <SupermarketCategoriesCard />

      {/* ═══ ONBOARDING HELPERS ═══ */}
      <section className="grid gap-6 lg:grid-cols-2">
        <FirstStepsCard />
        <HowItWorksCard />
      </section>

      {/* ═══ CATEGORIES + RECENT MOVEMENTS ═══ */}
      <section className="grid gap-6 lg:grid-cols-2">
        <EmptyStateCard
          icon={Search}
          title="Gastos por categoría"
          description="Cuando registren su primer gasto, vas a ver el desglose por categoría."
        />
        <EmptyStateCard
          icon={Search}
          title="Últimos movimientos"
          description="Los movimientos compartidos aparecerán acá."
        />
      </section>
    </div>
  )
}

/* ── Subcomponentes Auxiliares ── */

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  colorClass,
  dotClass,
  glassBadge = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  description: string
  colorClass: string
  dotClass: string
  glassBadge?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {glassBadge ? (
          <LiquidGlass variant="badge" intensity="medium" className={`flex h-9 w-9 items-center justify-center ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </LiquidGlass>
        ) : (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground font-medium">{label}</p>
        <p className="mt-2 text-xs leading-4 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function SupermarketCategoriesCard() {
  const categories = [
    { label: 'Alimentos', value: '$0' },
    { label: 'Higiene', value: '$0' },
    { label: 'Snacks', value: '$0' },
  ]

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <ShoppingBasket className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Top categorías de súper</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando carguen productos del ticket, vas a ver dónde se concentra el gasto.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
          Próximamente
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <div key={category.label} className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="text-sm font-semibold text-foreground">{category.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{category.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">Aparecerá con ítems registrados.</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FirstStepsCard() {
  const steps = [
    { label: 'Crear cuenta', done: true },
    { label: 'Crear Lovehold', done: false },
    { label: 'Invitar a Ale', done: false },
    { label: 'Registrar primer gasto', done: false },
  ]

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Primeros pasos</h2>
          <p className="mt-1 text-sm text-muted-foreground">1 de 4 completado</p>
        </div>
        <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
          25%
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-soft">
        <div className="h-full w-1/4 rounded-full bg-primary" />
      </div>
      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${step.done
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface-soft text-muted-foreground'
              }`}>
              {step.done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </span>
            <span className={`text-sm font-semibold ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorksCard() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-base font-bold text-foreground">Cómo funciona</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Cuando uno paga algo compartido, Lovehold calcula automáticamente cuánto corresponde a cada uno y mantiene el balance actualizado.
      </p>
      <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-foreground">Delivery $900</p>
            <p className="mt-1 text-xs text-muted-foreground">Paga Ale</p>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            Andrés debe $450
          </div>
        </div>
      </div>
    </section>
  )
}

function EmptyStateCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-soft">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
