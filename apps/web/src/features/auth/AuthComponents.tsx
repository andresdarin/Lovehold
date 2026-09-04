'use client'

import React from 'react'
import { LoaderCircle, ArrowRight } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'

export function AuthBrand({ title = 'FINNIC', subtitle = 'Tu copiloto financiero', tagline }: {
  title?: string; subtitle?: string; tagline?: string
}) {
  return <header className="flex flex-col items-center text-center select-none">
    <div className="mb-3 flex items-center justify-center">
      <div className="dark:hidden transition-transform duration-300 hover:scale-105"><FinnicOwlIcon color="navy" className="h-16 w-16 sm:h-20 sm:w-20" /></div>
      <div className="hidden transition-transform duration-300 hover:scale-105 dark:block"><FinnicOwlIcon color="aqua" className="h-16 w-16 sm:h-20 sm:w-20" /></div>
    </div>
    <div className="mb-1 flex items-center justify-center">
      <img src="/brand/finnic-logo-navy.png" alt="Finnic Logo" className="h-8 w-auto object-contain sm:h-9 dark:hidden" />
      <img src="/brand/finnic-logo-cream.png" alt="Finnic Logo" className="hidden h-8 w-auto object-contain sm:h-9 dark:block" />
    </div>
    {title && title.toUpperCase() !== 'FINNIC' && <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-navy sm:text-2xl dark:text-foreground">{title}</h1>}
    <p className="mt-1 max-w-[280px] text-xs font-medium tracking-wide text-navy/75 sm:max-w-none sm:text-sm dark:text-text-secondary">{subtitle}</p>
    {tagline && <p className="mt-1 text-xs text-text-secondary">{tagline}</p>}
  </header>
}

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; label: string; icon: React.ReactNode; rightElement?: React.ReactNode
}

export function AuthField({ id, label, icon, rightElement, className = '', ...props }: AuthFieldProps) {
  return <div className="group relative flex flex-col justify-center px-4 py-3.5 transition-colors sm:px-5 sm:py-4 focus-within:bg-sand/30 dark:focus-within:bg-surface-alt/30">
    <label htmlFor={id} className="sr-only">{label}</label>
    <div className="flex items-center gap-3.5"><span className="shrink-0">{icon}</span>
      <input id={id} className={`auth-input w-full bg-transparent text-sm font-medium text-navy placeholder:text-navy/45 focus:outline-none sm:text-base dark:text-foreground dark:placeholder:text-muted-foreground/50 ${className}`} {...props} />
      {rightElement && <div className="flex shrink-0 items-center">{rightElement}</div>}
    </div>
  </div>
}

export function AuthSubmitButton({ loading, disabled, ariaLabel, className = '' }: {
  loading?: boolean; disabled?: boolean; ariaLabel: string; className?: string
}) {
  return <button type="submit" disabled={disabled || loading} aria-label={ariaLabel}
    className={`group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-navy bg-navy text-sand transition-all duration-200 hover:scale-105 hover:border-primary-hover hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:h-15 sm:w-15 dark:border-aqua dark:bg-aqua dark:text-navy dark:hover:border-primary-hover dark:hover:bg-primary-hover ${className}`}>
    {loading ? <LoaderCircle className="h-6 w-6 animate-spin stroke-[2.4]" /> : <ArrowRight className="h-6 w-6 stroke-[2.4] transition-transform duration-200 group-hover:translate-x-0.5" />}
  </button>
}
