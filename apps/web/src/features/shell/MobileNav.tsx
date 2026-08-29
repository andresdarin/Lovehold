'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Home, CircleDollarSign, TrendingUp, WalletCards, Plus } from 'lucide-react'
import GlobalActionSheet from './GlobalActionSheet'

interface MobileNavProps {
  profile?: {
    displayName: string | null
    email: string
    color: string
    avatarUrl?: string | null
  } | null
  onAddClick?: () => void
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'dashboard', label: 'Inicio', href: '/dashboard', icon: Home },
  { id: 'finanzas', label: 'Finanzas', href: '/finanzas', icon: CircleDollarSign },
  { id: 'balance', label: 'Balance', href: '/balance', icon: TrendingUp },
  { id: 'expenses', label: 'Movimientos', href: '/expenses', icon: WalletCards },
]

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 0.6,
}

const MotionLink = motion.create(Link)

export default function MobileNav({ onAddClick }: MobileNavProps) {
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href) && (href !== '/expenses' || pathname !== '/expenses/new')
  }

  const handleAddPress = () => {
    if (onAddClick) {
      onAddClick()
    } else {
      setIsSheetOpen(true)
    }
  }

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-[calc(14px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-full max-w-[450px] px-2.5 sm:px-3 z-40 pointer-events-none lg:hidden flex items-center justify-between gap-2.5"
      >
        <LayoutGroup id="mobile-nav-group">
          {/* 1. Contenedor de 4 tabs tipo pill */}
          <motion.div
            layout
            transition={SPRING_CONFIG}
            className="pointer-events-auto flex-1 h-[58px] bg-surface/95 backdrop-blur-md border border-border rounded-full p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.5)] flex items-center justify-between overflow-hidden"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = isItemActive(item.href)

              return (
                <MotionLink
                  key={item.id}
                  href={item.href}
                  layout
                  transition={SPRING_CONFIG}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  className={`relative flex items-center justify-center h-full rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'px-3.5 sm:px-4 text-primary-foreground font-semibold'
                      : 'px-3 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavActivePill"
                      className="absolute inset-0 bg-primary rounded-full shadow-xs"
                      transition={SPRING_CONFIG}
                    />
                  )}

                  <motion.div
                    layout="position"
                    transition={SPRING_CONFIG}
                    className="relative z-10 flex items-center gap-2"
                  >
                    <Icon className="h-[21px] w-[21px] shrink-0 stroke-[2.2]" />
                    <AnimatePresence mode="popLayout" initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, x: -4, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, x: -4, filter: 'blur(4px)' }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="whitespace-nowrap text-[13px] tracking-tight select-none"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </MotionLink>
              )
            })}
          </motion.div>
        </LayoutGroup>

        {/* 2. Botón circular '+' con ActionSheet */}
        <motion.button
          type="button"
          onClick={handleAddPress}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.15 }}
          aria-label="Agregar movimiento"
          className="pointer-events-auto h-[58px] w-[58px] shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary-hover active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </motion.button>
      </nav>

      <GlobalActionSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </>
  )
}
