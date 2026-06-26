'use client'

import Link from 'next/link'
import React from 'react'
import { 
  Check, 
  Circle, 
  Coffee, 
  Heart, 
  Home, 
  Plus, 
  QrCode, 
  Repeat, 
  Search, 
  ShoppingBasket, 
  TrendingUp, 
  Wallet,
  ArrowUpRight,
  ShoppingCart,
  Scale,
  Fuel,
  Bike
} from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'
import LiquidGlass from '@/components/ui/LiquidGlass'

/**
 * Dashboard principal de Lovehold.
 * Adaptado responsivamente: mantiene la vista original en desktop (lg:)
 * y renderiza un dashboard sintetizado, elegante y dark en mobile/PWA.
 */
export default function DashboardPage() {
  const { profile } = useProfile()

  const firstName = profile?.displayName?.split(' ')[0]
  const greetingTime = new Date().getHours() < 12 ? 'BUEN DÍA' : new Date().getHours() < 18 ? 'BUENAS TARDES' : 'BUENAS NOCHES'
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <>
      {/* ═══════════ DESKTOP VIEW (lg:) ═══════════ */}
      <div className="hidden lg:block space-y-6">
        {/* Header Desktop */}
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

        {/* Profile Card Desktop */}
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

        {/* Empty State Card Desktop */}
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

        {/* Metric Cards Desktop */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard icon={Wallet} label="Gasto total del mes" value="$0" description="Todavía no registraron gastos" colorClass="text-primary bg-primary/10" dotClass="bg-primary" />
          <MetricCard icon={TrendingUp} label="Balance actual" value="$0" description="Sin deudas entre ustedes" colorClass="text-accent bg-accent/10" dotClass="bg-accent" glassBadge />
          <MetricCard icon={Repeat} label="Nafta este mes" value="$0" description="Primer módulo sugerido" colorClass="text-gold bg-gold/10" dotClass="bg-gold" />
          <MetricCard icon={Coffee} label="Delivery este mes" value="$0" description="Ideal para pedidos compartidos" colorClass="text-primary bg-primary/10" dotClass="bg-primary/50" />
        </section>

        <SupermarketCategoriesCard />

        {/* Onboarding Helpers Desktop */}
        <section className="grid gap-6 lg:grid-cols-2">
          <FirstStepsCard />
          <HowItWorksCard />
        </section>

        {/* Categories + Recent Movements Desktop */}
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

      {/* ═══════════ MOBILE/PWA VIEW (< lg) ═══════════ */}
      <div className="block lg:hidden space-y-5 -mt-2">
        {/* Waving Greeting Header */}
        <div>
          <span className="text-[10px] font-bold tracking-wider text-neutral-500 block uppercase">
            {greetingTime}
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-0.5 flex items-center gap-2">
            {firstName ?? 'Andrés'} <span className="animate-[wave_1.5s_infinite] origin-[70%_70%]">👋</span>
          </h1>
        </div>

        {/* Invitation Banner Card */}
        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/5 text-lh-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Conectá con Ale</p>
              <p className="text-xs text-neutral-400 mt-0.5">Tu hogar compartido te espera</p>
            </div>
          </div>
          <button className="flex items-center gap-1 bg-[#e0546b]/20 hover:bg-[#e0546b]/35 border border-[#e0546b]/30 text-[#ff6b6b] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm">
            Invitar <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Subheading "ESTE MES" */}
        <div>
          <span className="text-[10px] font-bold tracking-wider text-neutral-500 block uppercase">
            ESTE MES
          </span>
          {/* Grid de Métricas 2x2 */}
          <div className="grid grid-cols-2 gap-3 mt-2.5">
            <MobileMetricCard icon={ShoppingCart} value="$0" label="Gasto del mes" iconColor="text-emerald-400 bg-emerald-400/10" />
            <MobileMetricCard icon={Scale} value="$0" label="Balance actual" iconColor="text-lh-primary bg-lh-primary/10" />
            <MobileMetricCard icon={Fuel} value="$0" label="Nafta este mes" iconColor="text-amber-400 bg-amber-400/10" />
            <MobileMetricCard icon={Bike} value="$0" label="Delivery este mes" iconColor="text-blue-400 bg-blue-400/10" />
          </div>
        </div>

        {/* Action Row: Agregar Gasto, Crear Hogar, Código */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <Link
            href="/expenses/new"
            style={{ background: 'linear-gradient(135deg, #e0546b, #c94d60)' }}
            className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl text-white shadow-md transition-transform active:scale-95 text-center"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px] font-bold leading-none">Agregar gasto</span>
          </Link>
          <button
            disabled
            className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl bg-neutral-900/60 border border-white/5 text-neutral-300 disabled:opacity-40 transition-transform active:scale-95 text-center"
          >
            <Home className="h-4.5 w-4.5 text-neutral-400" />
            <span className="text-[10px] font-bold leading-none">Crear hogar</span>
          </button>
          <button
            disabled
            className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl bg-neutral-900/60 border border-white/5 text-neutral-300 disabled:opacity-40 transition-transform active:scale-95 text-center"
          >
            <QrCode className="h-4.5 w-4.5 text-neutral-400" />
            <span className="text-[10px] font-bold leading-none">Código</span>
          </button>
        </div>

        {/* Top Categorías del Super */}
        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold tracking-wider text-neutral-500 block uppercase">
              CATEGORÍAS DEL SÚPER
            </span>
            <button className="text-xs font-bold text-neutral-400 hover:text-white border border-white/10 rounded-full px-3 py-1 bg-white/5 transition-colors">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-3">
            <MobileCategoryRow label="Alimentos" icon="🥦" />
            <MobileCategoryRow label="Higiene" icon="🧴" />
            <MobileCategoryRow label="Snacks" icon="🍿" />
          </div>
        </div>

        {/* Onboarding: Primeros Pasos */}
        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-4 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-white">Primeros pasos</p>
            </div>
            <span className="text-xs font-extrabold bg-[#e0546b]/20 text-[#ff6b6b] px-2 py-0.5 rounded-full">
              25%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5 mb-4">
            <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-lh-primary to-[#ff6b6b]" />
          </div>

          <div className="space-y-2.5">
            <MobileStepRow label="Crear cuenta" checked={true} />
            <MobileStepRow label="Crear Lovehold" checked={false} stepIcon="home" />
            <MobileStepRow label="Invitar a Ale" checked={false} />
            <MobileStepRow label="Registrar primer gasto" checked={false} />
          </div>
        </div>

        {/* Cómo funciona Box */}
        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-4 shadow-lg">
          <p className="text-sm font-bold text-white">¿Cómo funciona?</p>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Cuando uno paga algo compartido, Lovehold calcula cuánto le corresponde a cada uno automáticamente.
          </p>
          
          <div className="mt-3.5 rounded-xl bg-black/45 border border-white/5 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Delivery</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Pagó Ale · $900</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold text-white">$900</span>
              <span className="text-[10px] font-semibold text-amber-500 mt-0.5">Andrés debe $450</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Subcomponentes Desktop Auxiliares ── */

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

/* ── Subcomponentes Mobile Auxiliares ── */

function MobileMetricCard({
  icon: Icon,
  value,
  label,
  iconColor
}: {
  icon: React.ElementType
  value: string
  label: string
  iconColor: string
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-3.5 flex flex-col justify-between h-24 shadow-sm select-none">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconColor} shrink-0`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-[10px] text-neutral-400 font-bold mt-1 tracking-wide">{label}</p>
      </div>
    </div>
  )
}

function MobileCategoryRow({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center justify-between py-1 select-none">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Sin movimientos aún</p>
        </div>
      </div>
      {/* Empty bar design */}
      <span className="h-1 w-12 bg-white/5 rounded-full block" />
    </div>
  )
}

function MobileStepRow({ label, checked, stepIcon }: { label: string; checked: boolean; stepIcon?: string }) {
  return (
    <div className="flex items-center gap-3 select-none">
      {checked ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
          <Check className="h-3 w-3" />
        </span>
      ) : (
        <>
          {stepIcon === 'home' ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e0546b]/30 bg-black text-[#e0546b]/70">
              <Home className="h-2.5 w-2.5" />
            </span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-black text-neutral-600" />
          )}
        </>
      )}
      <span className={`text-xs font-bold ${checked ? 'text-white' : 'text-neutral-400'}`}>
        {label}
      </span>
    </div>
  )
}
