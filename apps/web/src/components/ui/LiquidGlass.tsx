'use client'

import React from 'react'

type LiquidGlassIntensity = 'subtle' | 'medium' | 'strong'
type LiquidGlassVariant = 'card' | 'button' | 'badge' | 'nav'

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
  intensity?: LiquidGlassIntensity
  variant?: LiquidGlassVariant
  disabled?: boolean
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function LiquidGlass({
  children,
  className,
  intensity = 'subtle',
  variant = 'card',
  disabled = false,
  ...props
}: LiquidGlassProps) {
  return (
    <div
      {...props}
      data-intensity={intensity}
      data-variant={variant}
      data-disabled={disabled ? 'true' : undefined}
      aria-disabled={disabled || undefined}
      className={cx('liquid-glass', className)}
    >
      {children && <div className="liquid-glass__content">{children}</div>}
    </div>
  )
}
