'use client'

import React from 'react'
import { LoaderCircle, ArrowRight } from 'lucide-react'

/**
 * Encabezado de marca Finnic centrado con jerarquía editorial Navy.
 */
export function AuthBrand({
  title = 'FINNIC',
  subtitle = 'Tu copiloto financiero',
  tagline,
}: {
  title?: string
  subtitle?: string
  tagline?: string
}) {
  return (
    <header className="flex flex-col items-center text-center select-none">
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.32em] text-navy/90 dark:text-aqua">
        FINNIC
      </span>
      <h1 className="mt-2 text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold tracking-tight text-navy dark:text-foreground leading-tight">
        {title}
      </h1>
      <p className="mt-2 text-xs sm:text-sm font-medium text-navy/75 dark:text-text-secondary tracking-wide max-w-[280px] sm:max-w-none">
        {subtitle}
      </p>
      {tagline && (
        <p className="mt-1 text-xs text-text-secondary">
          {tagline}
        </p>
      )}
    </header>
  )
}

/**
 * Campo de entrada horizontal estilizado para glassmorphism mate y cálido con autofill armonizado.
 */
interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: React.ReactNode
  rightElement?: React.ReactNode
}

export function AuthField({
  id,
  label,
  icon,
  rightElement,
  className = '',
  ...props
}: AuthFieldProps) {
  return (
    <div className="group relative flex flex-col justify-center px-4 sm:px-5 py-3.5 sm:py-4 transition-colors focus-within:bg-sand/30 dark:focus-within:bg-surface-alt/30">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-3.5">
        <span className="shrink-0 transition-colors">
          {icon}
        </span>
        <input
          id={id}
          className={`auth-input w-full bg-transparent text-sm sm:text-base font-medium text-navy dark:text-foreground placeholder:text-navy/45 dark:placeholder:text-muted-foreground/50 focus:outline-none ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="shrink-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * CTA circular sólido (100% opaco) con protagonismo Navy en Light y Aqua en Dark.
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
      className={`group relative flex h-14 w-14 sm:h-15 sm:w-15 shrink-0 items-center justify-center rounded-full bg-[#083A4F] text-[#F5F2EE] dark:bg-[#C0D5D6] dark:text-[#083A4F] border-2 border-[#083A4F] dark:border-[#C0D5D6] shadow-xl shadow-[#083A4F]/35 dark:shadow-black/60 transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-[#0B465D] hover:border-[#0B465D] dark:hover:bg-[#D3E3E4] dark:hover:border-[#D3E3E4] active:bg-[#062c3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none ${className}`}
    >
      {loading ? (
        <LoaderCircle className="h-6 w-6 animate-spin stroke-[2.4]" />
      ) : (
        <ArrowRight className="h-6 w-6 stroke-[2.4] transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  )
}

/**
 * Fondo ambiental y fotográfico integrado armónicamente con Navy y Sand.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Fotografía de fondo editorial */}
      <img
        src="/brand/finnic-bg.jpg"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-center transform scale-105"
      />

      {/* Capa de calidez Sand (Light) y profundidad Navy (Dark) */}
      <div className="absolute inset-0 bg-sand/60 dark:bg-[#071D27]/85 backdrop-blur-[2px] transition-colors duration-500" />
      
      {/* Overlay tonal Navy de muy baja opacidad para anclar la identidad */}
      <div className="absolute inset-0 bg-navy/15 dark:bg-navy/35 mix-blend-multiply transition-colors duration-500" />
      
      {/* Gradientes de viñeta suave para máxima legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/40 hidden md:block" />
    </div>
  )
}
