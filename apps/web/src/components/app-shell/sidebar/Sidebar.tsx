'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, useAnimatedIndicator } from './hooks'
import SidebarHeader from './SidebarHeader'
import SidebarNav from './SidebarNav'
import SidebarFooter from './SidebarFooter'

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

export default function Sidebar({ profile, onLogout, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const activeHref = NAV_ITEMS.find((item) => pathname === item.href)?.href ?? '/dashboard'
  const { navRef, itemRefs, indicator, hoveredHref, setHoveredHref } = useAnimatedIndicator(collapsed, activeHref)

  return (
    <aside
      className={`fixed bottom-5 left-5 top-5 z-30 hidden flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-3 text-[#2D255F] shadow-[0_24px_70px_rgba(45,37,95,0.14)] backdrop-blur-2xl transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-[#050505]/76 dark:text-white dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)] lg:flex ${
        collapsed ? 'w-[84px]' : 'w-[248px]'
      }`}
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      <SidebarNav
        collapsed={collapsed}
        profile={profile}
        navRef={navRef}
        itemRefs={itemRefs}
        indicator={indicator}
        hoveredHref={hoveredHref}
        onHoverChange={setHoveredHref}
      />
      <SidebarFooter collapsed={collapsed} profile={profile} onLogout={onLogo