'use client'

import React, { useState } from 'react'
import { Sparkle, CheckCircle2, Circle, HelpCircle } from 'lucide-react'

function StepBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold ${
        done
          ? 'border-success/30 bg-success/5 text-success'
          : 'border-border bg-surface text-muted-foreground'
      }`}
    >
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </div>
  )
}

/**
 * Módulo de Onboarding y bloque de ayuda interactivo.
 */
export default function DashboardOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showHelper, setShowHelper] = useState(false)

  return (
    <div className="flex flex-col gap-4">
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
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Ocultar
            </button>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full w-1/4 rounded-full bg-primary transition-all duration-500" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StepBadge label="Cuenta creada" done />
            <StepBadge label="Primer gasto personal" done={false} />
            <StepBadge label="Invitar a tu pareja" done={false} />
            <StepBadge label="Presupuesto mensual" done={false} />
          </div>
        </section>
      )}

      {/* Help tooltip toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span>¿Cómo gestiona Finnic los gastos personales y en pareja?</span>
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
          <p className="font-semibold text-foreground mb-1">
            Finanzas personales con sincronización en pareja
          </p>
          Llevá el control total de tus gastos individuales y, cuando compartas un gasto del hogar o en pareja, Finnic calculará automáticamente la división 50/50 manteniendo tu balance actualizado.
        </div>
      )}
    </div>
  )
}
