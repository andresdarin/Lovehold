'use client'

import React from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'

interface SidebarFooterProps {
  collapsed: boolean
  profile: {
    displayName: string | null
    email: string
    color: string
  } | null
  onLogout: () => void
}

export default function SidebarFooter({ collapsed, profile, onLogout }: SidebarFooterProps) {
  const userInitial = (profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()

  return (
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
        <Link
          href="/profile"
          className={`flex items-center rounded-[1.125rem] cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${collapsed ? 'justify-center' : 'gap-3 bg-white/35 p-2 dark:bg-black/25'} hover:bg-white/55 dark:hover:bg-white/[0.12]`}
          aria-label="Ir al perfil"
        >
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
        </Link>
      )}
    </div>
  )
}
