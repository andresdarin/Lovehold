'use client'

import { useEffect, useState } from 'react'
import { ONBOARDING_STEP_DEFINITIONS } from '../constants'
import { useDashboardData } from '../DashboardData'
import type { OnboardingStep } from '../types'

const ONBOARDING_FLAGS = ['balance', 'assistant'] as const

export function useDashboardOnboarding(): OnboardingStep[] {
  const { expenses } = useDashboardData()
  const hasMovement = expenses.length > 0
  const [visitedSteps, setVisitedSteps] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const storedSteps = ONBOARDING_FLAGS.reduce<Record<string, boolean>>((steps, step) => {
      steps[step] = localStorage.getItem(`finnic-onboarding-${step}`) === 'true'
      return steps
    }, {})
    setVisitedSteps(storedSteps)
  }, [])

  return ONBOARDING_STEP_DEFINITIONS.map((step) => ({
    ...step,
    done:
      step.id === 'account' ||
      (step.id === 'first-expense' && hasMovement) ||
      ((step.id === 'balance' || step.id === 'assistant') && visitedSteps[step.id] === true),
  }))
}
