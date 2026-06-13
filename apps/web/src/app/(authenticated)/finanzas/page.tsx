'use client'

import React from 'react'
import { BadgeDollarSign } from 'lucide-react'
import PersonalFinancePageContent from '@/features/personal-finance/PersonalFinancePageContent'

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-soft border border-border">
          <BadgeDollarSign className="h-5 w-5 text-foreground/80" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Finanzas Personales</h1>
          <p className="text-sm text-muted-foreground">Controlá tus finanzas personales y llevá un registro detallado</p>
        </div>
      </header>

      <PersonalFinancePageContent />
    </div>
  )
}
