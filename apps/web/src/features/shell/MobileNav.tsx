'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, TrendingUp, BadgeDollarSign } from 'lucide-react'

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
        className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1 rounded-full transition-all duration-180 ease-in-out ${
          isActive 
            ? 'bg-primary/12 text-primary' 
            : 'text-white/50 hover:text-white'
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
        className="flex h-[54px] w-[54px] items-center justify-center rounded-full transition-all duration-180 hover:scale-105 active:scale-95 outline-none cursor-pointer overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.30)]"
      >
        {/* Imagen para tema claro */}
        <img 
          src="/icons/central_light.png" 
          alt="Agregar gasto" 
          className="h-full w-full object-cover block dark:hidden"
        />
        {/* Imagen para tema oscuro */}
        <img 
          src="/icons/central_dark.png" 
          alt="Agregar gasto" 
          className="h-full w-full object-cover hidden dark:block"
        />
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
      className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[400px] h-16 rounded-full border border-white/10 bg-[#18181b]/78 backdrop-blur-[24px] saturate-[180%] -webkit-backdrop-filter: blur(24px) saturate(180%) shadow-[0_18px_48px_rgba(0,0,0,0.45)] lg:hidden z-50"
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
