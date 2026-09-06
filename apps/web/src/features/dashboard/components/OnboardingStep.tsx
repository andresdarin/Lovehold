'use client'

import Link from 'next/link'
import type { OnboardingStep as OnboardingStepType } from '../types'

export default function OnboardingStep({ step }: { step: OnboardingStepType }) {
  return (
    <li>
      <Link
        href={step.href}
        onClick={() => {
          if (step.id === 'balance' || step.id === 'assistant') {
            localStorage.setItem(`finnic-onboarding-${step.id}`, 'true')
          }
        }}
        className={`flex h-10 items-center gap-2 border-b text-sm transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          step.done
            ? 'text-muted-foreground'
            : 'text-foreground hover:text-primary'
        }`}
        aria-label={`${step.label}${step.done ? ': completado' : ''}`}
      >
        <span aria-hidden className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none ${step.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
          {step.done ? '✓' : null}
        </span>
        <span className={step.done ? 'line-through' : undefined}>{step.label}</span>
      </Link>
    </li>
  )
}
