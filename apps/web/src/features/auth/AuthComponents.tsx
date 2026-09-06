'use client'

import React from 'react'
import { LoaderCircle, ArrowRight } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'

export interface AuthBrandProps {
  title?: string
  subtitle?: string
  tagline?: string
  hideHeaderOnIntro?: boolean
  showWordmark?: boolean
  showOwl?: boolean
  className?: string
}

/**
 * Encabezado de marca para autenticación Finnic.
 * Tipografía limpia, espaciado equilibrado y glifos vectoriales nítidos.
 */
export function AuthBrand({
  title,
  subtitle = 'Tu copiloto financiero',
  tagline,
  showOwl = true,
  showWordmark = true,
  className = '',
}: AuthBrandProps) {
  return (
    <header className={`flex flex-col items-center text-center select-none ${className}`}>
      {showOwl && (
        <div className="mb-3 flex items-center justify-center">
          <div className="dark:hidden transition-transform duration-300 hover:scale-105">
            <FinnicOwlIcon color="navy" className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-xs" />
          </div>
          <div className="hidden transition-transform duration-300 hover:scale-105 dark:block">
            <FinnicOwlIcon color="aqua" className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-xs" />
          </div>
        </div>
      )}

      {showWordmark && (
        <div className="mb-1 flex items-center justify-center">
          <img
            src="/brand/finnic-logo-navy.png"
            alt="Finnic"
            className="h-7 w-auto object-contain sm:h-8 dark:hidden"
          />
          <img
            src="/brand/finnic-logo-cream.png"
            alt="Finnic"
            className="hidden h-7 w-auto object-contain sm:h-8 dark:block"
          />
        </div>
      )}

      {title && (
        <h1 className="type-display mt-1.5 text-xl text-navy dark:text-foreground">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="mt-0.5 text-xs font-medium tracking-wide text-navy/70 sm:text-sm dark:text-text-secondary">
          {subtitle}
        </p>
      )}

      {tagline && (
        <p className="mt-1 text-[11px] text-text-secondary">
          {tagline}
        </p>
      )}
    </header>
  )
}

export interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: React.ReactNode
  rightElement?: React.ReactNode
}

/**
 * Campo de input ultra-minimalista.
 * Cero recuadros, bordes invasivos o saltos de layout al interactuar.
 */
export function AuthField({
  id,
  label,
  icon,
  rightElement,
  className = '',
  ...props
}: AuthFieldProps) {
  return (
    <div className="group relative flex flex-col justify-center px-4 py-3.5 sm:px-5 sm:py-4">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-3.5">
        <span className="shrink-0 transition-opacity group-focus-within:opacity-100 opacity-80">
          {icon}
        </span>
        <input
          id={id}
          style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
          className={`auth-input w-full border-0 bg-transparent text-base font-medium text-navy placeholder:text-navy/40 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none active:outline-none active:ring-0 selection:bg-transparent dark:text-foreground dark:placeholder:text-muted-foreground/45 ${className}`}
          {...props}
        />
        {rightElement && <div className="flex shrink-0 items-center">{rightElement}</div>}
      </div>
    </div>
  )
}

/**
 * Botón circular insignia de avance con flecha.
 * Mantiene micro-interacciones pulidas de hover y press con feedback háptico visual.
 */
export function AuthSubmitButton({
  loading,
  disabled,
  ariaLabel,
  className = '',
}: {
  loading?: boolean
  disabled?: boolean
  ariaLabel: string
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`group relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-navy/15 bg-navy text-sand transition-all duration-200 hover:scale-105 hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 sm:h-14 sm:w-14 dark:border-aqua/20 dark:bg-aqua dark:text-navy dark:hover:bg-aqua/90 ${className}`}
    >
      {loading ? (
        <LoaderCircle className="h-5 w-5 animate-spin stroke-[2.4]" />
      ) : (
        <ArrowRight className="h-5 w-5 stroke-[2.4] transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  )
}
