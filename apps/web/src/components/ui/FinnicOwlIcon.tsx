import React from 'react'

interface FinnicOwlIconProps {
  className?: string
  color?: 'cream' | 'aqua' | 'navy' | 'gold'
}

/**
 * Icono oficial de Finnic (búho financiero con billetera).
 * Con fondo transparente y renderizado nítido.
 */
export default function FinnicOwlIcon({ className = 'h-5 w-5', color = 'cream' }: FinnicOwlIconProps) {
  const src =
    color === 'navy'
      ? '/brand/finnic-owl-navy.png'
      : color === 'aqua'
      ? '/brand/finnic-owl-aqua.png'
      : color === 'gold'
      ? '/brand/finnic-owl-gold.png'
      : '/brand/finnic-owl-cream.png'

  return (
    <img
      src={src}
      alt="Finnic"
      className={`object-contain select-none pointer-events-none transition-transform ${className}`}
    />
  )
}
