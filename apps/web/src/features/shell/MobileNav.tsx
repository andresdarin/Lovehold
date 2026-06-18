'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, TrendingUp, BadgeDollarSign } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'

interface MobileNavProps {
  profile: {
    displayName: string | null
    email: string
    color: string
  } | null
  onAddClick?: () => void
}

/**
 * MobileNav: Barra de navegación inferior flotante tipo "floating pill" con efecto glass.
 * Cuenta con accesos directos, balance, movimientos y un botón de acción principal central para agregar gastos.
 */
export default function MobileNav({ profile, onAddClick }: MobileNavProps) {
  const pathname = usePathname()
  const { theme } = useTheme()

  const navItemsLeft = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    ...(profile ? [{ label: 'Finanzas', href: '/finanzas', icon: BadgeDollarSign }] : []),
  ]

  const navItemsRight = [
    { label: 'Balance', href: '/balance', icon: TrendingUp },
    { label: 'Movimientos', href: '/expenses', icon: Wallet },
  ]

  const iconSrc = theme === 'light' ? '/icons/central_dark.png' : '/icons/central_light.png'

  const renderItem = (item: { label: string; href: string; icon: React.ElementType }) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2.5 py-1.5 rounded-full transition-all duration-180 ease-in-out ${
          isActive 
            ? 'bg-primary/12 text-primary' 
            : 'text-muted-foreground/80 hover:text-foreground'
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
      </Link>
    )
  }

  const renderCentralButton = () => {
    const buttonContent = (
      <img 
        src={iconSrc} 
        alt="Agregar gasto" 
        className="h-14 w-14 object-contain transition-all duration-180 hover:scale-105 active:scale-95 cursor-pointer" 
      />
    )

    if (onAddClick) {
      return (
        <button
          onClick={onAddClick}
          className="relative -translate-y-4 outline-none focus:outline-none"
          aria-label="Agregar gasto"
        >
          {buttonContent}
        </button>
      )
    }

    return (
      <Link
        href="/expenses/new"
        className="relative -translate-y-4 outline-none focus:outline-none"
        aria-label="Agregar gasto"
      >
        {buttonContent}
      </Link>
    )
  }

  return (
    <nav 
      aria-label="Navegación principal"
      className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[430px] h-[68px] rounded-full border border-white/10 bg-[#1c1c1e]/72 backdrop-blur-[24px] saturate-[180%] -webkit-backdrop-filter: blur(24px) saturate(180%) shadow-[0_16px_40px_rgba(0,0,0,0.45)] lg:hidden z-30"
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

