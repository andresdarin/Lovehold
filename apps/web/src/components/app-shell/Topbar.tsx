'use client'

import React from 'react'
import { Heart, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface TopbarProps {
  profile: {
    displayName: string | null
    email: string
    color: string
  } | null
  onLogout: () => void
}

/**
 * Topbar responsiva.
 * En mobile actúa como cabecera principal con el logo y controles.
 * En desktop se oculta ya que el Sidebar se encarga de la identidad y navegación.
 */
export default function Topbar({ profile, onLogout }: TopbarProps) {
  const userInitial = (profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()

  return (
    <header className="sticky top-0 left-0 right-0 flex h-16 items-center justify-between border-b border-border bg-surface px-6 lg:hidden z-20">
      {/* Identidad de Marca */}
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary fill-primary" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          L<Heart className="inline-block h-[0.55em] w-[0.55em] text-primary stroke-[4px] align-baseline mx-[0.03em] -translate-y-[0.08em]" />vehold
        </span>
      </div>

      {/* Controles / Perfil */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {profile && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-white text-xs"
            style={{ backgroundColor: profile.color ?? '#FF6B6B' }}
            title={profile.displayName ?? profile.email}
          >
            {userInitial}
          </div>
        )}

        <button
          onClick={onLogout}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface hover:bg-danger/10 hover:text-danger text-muted-foreground transition-colors focus:outline-none"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
