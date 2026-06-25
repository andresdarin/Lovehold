'use client'

import React, { useState } from 'react'
import Sidebar from './sidebar/Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'

interface AppShellProps {
  children: React.ReactNode
  profile: {
    displayName: string | null
    email: string
    color: string
  } | null
  onLogout: () => void
}

/**
 * AppShell unificado.
 * Configura la estructura principal y provee un layout adaptativo.
 */
export default function AppShell({ children, profile, onLogout }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-backdrop min-h-screen text-foreground overflow-x-hidden relative">
      {/* Sidebar (Desktop) */}
      <Sidebar
        profile={profile}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Topbar (Mobile) */}
      <Topbar profile={profile} onLogout={onLogout} />

      {/* Contenido Principal */}
      <main
        className={`min-h-[calc(100dvh-4rem)] lg:min-h-screen pb-[calc(104px+env(safe-area-inset-bottom))] lg:pb-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[124px]' : 'lg:pl-[292px]'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <MobileNav profile={profile} />
    </div>
  )
}
