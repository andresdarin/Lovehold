'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, TrendingUp, BadgeDollarSign, Plus } from 'lucide-react'

interface MobileNavProps {
  profile: {
    displayName: string | null
    email: string
    color: string
    avatarUrl?: string | null
  } | null
  onAddClick?: () => void
}

/**
 * MobileNav: Barra de navegación inferior flotante tipo "floating pill" compacta.
 * Cuenta con accesos directos, balance, movimientos y un botón de acción principal central para agregar gastos.
 */
export default function MobileNav({ profile, onAddClick }: MobileNavProps) {
  const pathname = usePathname()

  const navItemsLeft = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    ...(profile ? [{ label: 'Finanzas', href: '/finanzas', icon: BadgeDollarSign }] : []),
  ]

  const navItemsRight = [
    { label: 'Balance', href: '/balance', icon: TrendingUp },
    { label: 'Movimientos', href: '/expenses', icon: Wallet },
  ]

  const renderItem = (item: { label: string; href: string; icon: React.ElementType }) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2.5 py-1 rounded-full transition-all duration-200 ease-in-out ${
          isActive 
            ? 'bg-primary/10 text-primary font-bold shadow-xs' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
      </Link>
    )
  }

  const renderCentralButton = () => {
    const buttonContent = (
      <span 
        className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95 outline-none cursor-pointer shadow-[0_6px_20px_rgba(8,58,79,0.3)] dark:shadow-[0_6px_20px_rgba(192,213,214,0.2)] hover:bg-primary-hover"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </span>
    )

    if (onAddClick) {
      return (
        <button
          onClick={onAddClick}
          className="relative -translate-y-3.5 outline-none focus:outline-none"
          aria-label="Agregar gasto"
        >
          {buttonContent}
        </button>
      )
    }

    return (
      <Link
        href="/expenses/new"
        className="relative -translate-y-3.5 outline-none focus:outline-none"
        aria-label="Agregar gasto"
      >
        {buttonContent}
      </Link>
    )
  }

  return (
    <nav 
      aria-label="Navegación principal"
      className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[400px] h-16 rounded-full border border-border bg-surface/90 dark:bg-surface/85 backdrop-blur-[24px] saturate-[180%] -webkit-backdrop-filter: blur(24px) saturate(180%) shadow-[0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)] lg:hidden z-50 transition-colors"
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* Left items group */}
        <div className="flex flex-1 justify-around">
          {navItemsLeft.map(renderItem)}
        </div>

        {/* Central action button */}
        {renderCentralButton()}

        {/* Right items group */}
        <div className="flex flex-1 justify-around">
          {navItemsRight.map(renderItem)}
        </div>
      </div>
    </nav>
  )
}
