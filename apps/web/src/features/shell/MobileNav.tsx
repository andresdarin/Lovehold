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
 * MobileNav: Barra de navegación inferior persistente en mobile.
 * Cuenta con accesos directos y un botón de acción principal central para agregar gastos.
 */
export default function MobileNav({ profile, onAddClick }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    ...(profile ? [{ label: 'Finanzas', href: '/finanzas', icon: BadgeDollarSign }] : []),
    { label: 'Movimientos', href: '/expenses', icon: Wallet },
    { label: 'Agregar', href: '#', icon: Plus, isAction: true },
    { label: 'Balance', href: '/balance', icon: TrendingUp },
    { label: 'Ajustes', href: '/settings', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface text-foreground lg:hidden z-30 pb-safe shadow-lg">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon

          if (item.isAction) {
            return (
              <button
                key={index}
                disabled
                onClick={onAddClick}
                className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#FF3D8B] text-white shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed outline-none"
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
              className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
