'use client'

import React, { useState } from 'react'
import { Sparkle, CheckCircle2, Circle, HelpCircle } from 'lucide-react'

function StepBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold transition-all ${
        done
          ? 'border-[#208B6B]/40 bg-[#208B6B]/20 text-[#4BE3B5]'
          : 'border-white/[0.08] bg-white/[0.04] text-[#C0D5D6]/70'
      }`}
    >
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#4BE3B5]" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0 opacity-60" />
      )}
      <span className="truncate">{label}</span>
    </div>
  )
}

/**
 * Módulo de Onboarding y bloque de ayuda interactivo.
 * Sección "Primeros pasos" con estilo Navy coherente con el Hero superior.
 */
export default function DashboardOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showHelper, setShowHelper] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {showOnboarding && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] dark:from-[#04141D] dark:via-[#061D27] dark:to-[#051720] border border-white/[0.1] p-5 shadow-[0_12px_30px_rgba(8,58,79,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          {/* Luces de ambiente sutiles */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#407E8C]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#A58D66]/15 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-[#A58D66]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EE]">
                Primeros pasos (1 de 4)
              </h3>
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="text-xs text-[#C0D5D6]/70 hover:text-[#F5F2EE] font-medium transition-colors"
            >
              Ocultar
            </button>
          </div>

          <div className="relative z-10 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.1]">
            <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-[#A58D66] to-[#4BE3B5] transition-all duration-500" />
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StepBadge label="Cuenta creada" done />
            <StepBadge label="Primer gasto personal" done={false} />
            <StepBadge label="Invitar a tu pareja" done={false} />
            <StepBadge label="Presupuesto mensual" done={false} />
          </div>
        </section>
      )}

      {/* Help tooltip toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
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
