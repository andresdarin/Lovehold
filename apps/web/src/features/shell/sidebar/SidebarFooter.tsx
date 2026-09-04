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
    avatarUrl?: string | null
  } | null
  onLogout: () => void
}

export default function SidebarFooter({ collapsed, profile, onLogout }: SidebarFooterProps) {
  const userInitial = (profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()

  return (
    <div className={`flex flex-col gap-3 rounded-[1.5rem] border border-border bg-surface-soft/60 p-2 ${collapsed ? 'items-center' : ''}`}>
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
        <ThemeToggle variant="dock" />
        <button
          onClick={onLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {profile && (
        <Link
          href="/profile"
          className={`flex items-center rounded-2xl cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${collapsed ? 'justify-center' : 'gap-3 bg-surface p-2 border border-border/40'} hover:bg-surface-soft`}
          aria-label="Ir al perfil"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${profile.color ?? '#083A4F'}ee, ${profile.color ?? '#083A4F'})` 
            }}
            title={collapsed ? (profile.displayName ?? profile.email) : undefined}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName ?? 'Foto de perfil'}
                className="h-full w-full rounded-full object-cover block shrink-0"
              />
            ) : (
              <span className="text-xs">{userInitial}</span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">
                {profile.displayName ?? 'Sin nombre'}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {profile.email}
              </p>
            </div>
          )}
        </Link>
      )}
    </div>
  )
}
