'use client'

import React from 'react'
import FinnicOwlIcon from './FinnicOwlIcon'

interface FinnicBrandProps {
  /** Variante cromática: 'cream' para fondos oscuros/Hero, 'navy' para superficies claras, o 'auto' adaptativo al tema */
  variant?: 'cream' | 'navy' | 'auto'
  /** Escala visual del imagotipo */
  size?: 'sm' | 'md' | 'lg'
  /** Clases CSS adicionales para el contenedor flex */
  className?: string
}

/**
 * Logomarca horizontal oficial de Finnic.
 * Combina el isotipo de la lechuza con el wordmark tipográfico en composición horizontal balanceada.
 */
export default function FinnicBrand({
  variant = 'cream',
  size = 'md',
  className = '',
}: FinnicBrandProps) {
  const iconSizeClass =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'

  const wordmarkHeightClass =
    size === 'sm' ? 'h-4' : size === 'lg' ? 'h-6' : 'h-5'

  if (variant === 'auto') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        {/* Modo Light: Navy */}
        <FinnicOwlIcon color="navy" className={`${iconSizeClass} dark:hidden`} />
        <img
          src="/brand/finnic-logo-navy.png"
          alt="Finnic"
          className={`${wordmarkHeightClass} w-auto object-contain dark:hidden`}
        />

        {/* Modo Dark: Cream */}
        <FinnicOwlIcon color="cream" className={`${iconSizeClass} hidden dark:block`} />
        <img
          src="/brand/finnic-logo-cream.png"
          alt="Finnic"
          className={`${wordmarkHeightClass} w-auto object-contain hidden dark:block`}
        />
      </div>
    )
  }

  const isCream = variant === 'cream'

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <FinnicOwlIcon
        color={isCream ? 'cream' : 'navy'}
        className={`${iconSizeClass} ${isCream ? 'drop-shadow-[0_2px_8px_rgba(192,213,214,0.3)]' : ''}`}
      />
      <img
        src={isCream ? '/brand/finnic-logo-cream.png' : '/brand/finnic-logo-navy.png'}
        alt="Finnic"
        className={`${wordmarkHeightClass} w-auto object-contain`}
      />
    </div>
  )
}
