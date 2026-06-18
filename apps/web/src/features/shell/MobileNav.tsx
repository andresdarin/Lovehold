'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Plus, TrendingUp, Settings, BadgeDollarSign } from 'lucide-react'

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
 * Cuenta con accesos directos y un botón de acción principal central para agregar gastos (si está disponible).
 */
export default function MobileNav({ profile, onAddClick }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    ...(profile ? [{ label: 'Finanzas', href: '/finanzas', icon: BadgeDollarSign }] : []),
    { label: 'Movimientos', href: '/expenses', icon: Wallet },
    ...(onAddClick ? [{ label: 'Agregar', href: '#', icon: Plus, isAction: true }] : []),
    { label: 'Balance', href: '/balance', icon: TrendingUp },
    { label: 'Ajustes', href: '/settings', icon: Settings },
  ]

  return (
    <nav 
      aria-label="Navegación principal"
      className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[430px] h-[68px] rounded-full border border-white/10 bg-[#1c1c1e]/72 backdrop-blur-[24px] saturate-[180%] -webkit-backdrop-filter: blur(24px) saturate(180%) shadow-[0_16px_40px_rgba(0,0,0,0.45)] lg:hidden z-30"
    >
      <div className="flex h-full items-center justify-around px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon

          if ('isAction' in item && item.isAction) {
            return (
              <button
                key={index}
                onClick={onAddClick}
                className="relative -translate-y-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#FF3D8B] text-white shadow-[0_8px_24px_rgba(255,107,107,0.4)] transition-all duration-180 hover:scale-105 active:scale-95 outline-none cursor-pointer focus:ring-2 focus:ring-primary/45"
                aria-label="Agregar gasto"
              >
                <Icon className="h-7 w-7" />
              </button>
            )
          }

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
        })}
      </div>
    </nav>
  )
}

