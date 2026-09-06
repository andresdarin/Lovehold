'use client'

import { useState } from 'react'
import { ONBOARDING_COPY } from '../constants'
import { useDashboardOnboarding } from '../hooks/useDashboardOnboarding'
import OnboardingStep from './OnboardingStep'

export default function DashboardOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const steps = useDashboardOnboarding()
  const completed = steps.filter((step) => step.done).length

  return (
    <div className="w-full min-w-0">
      {showOnboarding ? (
        <section aria-labelledby="onboarding-title" className="w-full rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 id="onboarding-title" className="min-w-0 truncate text-sm font-semibold text-foreground">
              {ONBOARDING_COPY.title}
            </h3>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{completed}/{steps.length}</span>
            <button
              onClick={() => setShowOnboarding(false)}
              className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ocultar
            </button>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completed} aria-label={`${completed} de ${steps.length} pasos completados`}>
            <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(completed / steps.length) * 100}%` }} />
          </div>

          <ol className="mt-2" aria-label="Pasos para comenzar">
            {steps.map((step) => <OnboardingStep key={step.id} step={step} />)}
          </ol>
        </section>
      ) : (
        <button
          onClick={() => setShowOnboarding(true)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Mostrar primeros pasos
        </button>
      )}
    </div>
  )
}
