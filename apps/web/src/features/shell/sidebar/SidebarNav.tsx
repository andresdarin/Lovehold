'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { NAV_ITEMS } from './hooks'
import type { MutableRefObject } from 'react'

interface SidebarNavProps {
  collapsed: boolean
  profile: {
    displayName: string | null
    email: string
    color: string
  } | null
  navRef: MutableRefObject<HTMLElement | null>
  itemRefs: MutableRefObject<Record<string, HTMLAnchorElement | null>>
  indicator: { top: number; left: number; width: number; height: number; opacity: number }
  hoveredHref: string | null
  onHoverChange: (href: string | null) => void
}

export default function SidebarNav({ collapsed, profile, navRef, itemRefs, indicator, hoveredHref, onHoverChange }: SidebarNavProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.href !== '/finanzas' || profile
  )

  const activeHref = visibleItems.find((item) => pathname === item.href)?.href ?? '/dashboard'
  const targetHref = hoveredHref ?? activeHref

  return (
    <nav
      ref={navRef}
      onMouseLeave={() => onHoverChange(null)}
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

      {visibleItems.map((item) => {
        const isActive = pathname === item.href
        const isTarget = targetHref === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            ref={(node) => { itemRefs.current[item.href] = node }}
            href={item.href}
            onMouseEnter={() => onHoverChange(item.href)}
            onFocus={() => onHoverChange(item.href)}
            onBlur={() => onHoverChange(null)}
            title={collapsed ? item.label : undefined}
            className={`group relative z-10 flex h-12 items-center rounded-full text-sm font-semibold transition-all duration-200 ${
              collapsed ? 'mx-auto w-12 justify-center' : 'gap-3 px-3'
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
  )
}
