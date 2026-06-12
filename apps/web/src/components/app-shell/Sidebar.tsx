'use client'

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, TrendingUp, Fuel, Target, Settings, LogOut, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import LiquidGlass from '@/components/ui/LiquidGlass'

interface SidebarProps {
  profile: {
    displayName: string | null
    email: string
    color: string
  } | null
  onLogout: () => void
  collapsed: boolean
  onToggle: () => void
}

/**
 * Sidebar persistente para navegación desktop.
 * Colapsable: cuando está colapsado muestra solo íconos + favicon arriba.
 */
export default function Sidebar({ profile, onLogout, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const [indicator, setIndicator] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  })

  const navItems = useMemo(() => [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Movimientos', href: '/expenses', icon: Wallet },
    { label: 'Balance', href: '/balance', icon: TrendingUp },
    { label: 'Nafta', href: '/fuel', icon: Fuel },
    { label: 'Metas', href: '/goals', icon: Target },
    { label: 'Ajustes', href: '/settings', icon: Settings },
  ], [])

  const userInitial = (profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()
  const activeHref = navItems.find((item) => pathname === item.href)?.href ?? '/dashboard'
  const targetHref = hoveredHref ?? activeHref

  const updateIndicator = useCallback(() => {
    const nav = navRef.current
    const target = itemRefs.current[targetHref]

    if (!nav || !target) return

    const navRect = nav.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    setIndicator({
      top: targetRect.top - navRect.top,
      left: targetRect.left - navRect.left,
      width: targetRect.width,
      height: targetRect.height,
      opacity: 1,
    })
  }, [targetHref])

  useLayoutEffect(() => {
    updateIndicator()
    const frame = window.requestAnimationFrame(updateIndicator)
    const timeout = window.setTimeout(updateIndicator, 320)
    window.addEventListener('resize', updateIndicator)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [collapsed, updateIndicator])

  return (
    <aside
      className={`fixed bottom-5 left-5 top-5 z-30 hidden flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-3 text-[#2D255F] shadow-[0_24px_70px_rgba(45,37,95,0.14)] backdrop-blur-2xl transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-[#050505]/76 dark:text-white dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)] lg:flex ${
        collapsed ? 'w-[84px]' : 'w-[248px]'
      }`}
    >
      <div className={`flex h-14 items-center rounded-full border border-white/55 bg-white/45 dark:border-white/0 dark:bg-white/[0.06] ${collapsed ? 'justify-center' : 'gap-3 pl-3 pr-2'}`}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/45"
            title="Expandir menú"
            aria-label="Expandir menú"
          >
            <img
              src="/icons/favicon.png"
              alt=""
              className="h-11 w-11 drop-shadow-[0_12px_20px_rgba(255,107,107,0.45)]"
            />
          </button>
        ) : (
          <>
            <img
              src="/icons/favicon.png"
              alt=""
              className="h-11 w-11 shrink-0 drop-shadow-[0_12px_20px_rgba(255,107,107,0.45)]"
            />
            <span className="text-lg font-bold tracking-tight text-[#2D255F] dark:text-white">
              Lovehold
            </span>
            <button
              onClick={onToggle}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/40 text-[#2D255F]/55 transition-colors hover:bg-white/70 hover:text-[#2D255F] focus:outline-none focus:ring-2 focus:ring-primary/45 dark:border-white/10 dark:bg-black/30 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
              title="Colapsar menú"
              aria-label="Colapsar menú"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Navegación */}
      <nav
        ref={navRef}
        onMouseLeave={() => setHoveredHref(null)}
        className={`relative flex-1 space-y-2 ${collapsed ? 'py-6' : 'py-7'}`}
      >
        <motion.div
          className="pointer-events-none absolute z-0 rounded-full"
          animate={indicator}
          transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.55 }}
          aria-hidden="true"
        >
          <LiquidGlass
            variant="nav"
            intensity={collapsed ? 'subtle' : 'medium'}
            className="h-full w-full"
          />
        </motion.div>

        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isTarget = targetHref === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              ref={(node) => {
                itemRefs.current[item.href] = node
              }}
              href={item.href}
              onMouseEnter={() => setHoveredHref(item.href)}
              onFocus={() => setHoveredHref(item.href)}
              onBlur={() => setHoveredHref(null)}
              title={collapsed ? item.label : undefined}
              className={`group relative z-10 flex h-12 items-center rounded-full text-sm font-semibold transition-all duration-200 ${
                collapsed
                  ? 'mx-auto w-12 justify-center'
                  : 'gap-3 px-3'
              } ${
                isActive || isTarget
                  ? 'text-[#2D255F] dark:text-white'
                  : 'text-[#2D255F]/56 hover:text-[#2D255F] dark:text-white/52 dark:hover:text-white'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive || isTarget ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/55 group-hover:bg-white/70 dark:bg-white/[0.06] dark:group-hover:bg-white/[0.12]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`flex flex-col gap-3 rounded-[1.5rem] border border-white/55 bg-white/40 p-2 dark:border-white/0 dark:bg-white/[0.06] ${collapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
          <ThemeToggle variant="dock" />
          <button
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/40 text-[#2D255F]/55 transition-colors hover:bg-danger/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/45 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/55 dark:hover:bg-danger/[0.18]"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {profile && (
          <div className={`flex items-center rounded-[1.125rem] ${collapsed ? 'justify-center' : 'gap-3 bg-white/35 p-2 dark:bg-black/25'}`}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: profile.color ?? '#FF6B6B' }}
              title={collapsed ? (profile.displayName ?? profile.email) : undefined}
            >
              {userInitial}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2D255F] dark:text-white">
                  {profile.displayName ?? 'Sin nombre'}
                </p>
                <p className="truncate text-xs text-[#2D255F]/45 dark:text-white/45">
                  {profile.email}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
