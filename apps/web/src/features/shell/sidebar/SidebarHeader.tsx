'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'
import FinnicBrand from '@/components/ui/FinnicBrand'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

/**
 * Cabecera del sidebar de navegación.
 * Utiliza el nuevo icono de la lechuza en estado colapsado y la logomarca horizontal expandida.
 */
export default function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div
      className={`flex h-14 items-center rounded-full border border-border bg-surface-soft/60 ${
        collapsed ? 'justify-center' : 'justify-between pl-3.5 pr-2'
      }`}
    >
      {collapsed ? (
        <button
          onClick={onToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          title="Expandir menú"
          aria-label="Expandir menú"
        >
          <FinnicOwlIcon color="navy" className="h-7 w-7 dark:hidden" />
          <FinnicOwlIcon color="cream" className="h-7 w-7 hidden dark:block" />
        </button>
      ) : (
        <>
          <FinnicBrand variant="auto" size="md" />
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 shrink-0"
            title="Colapsar menú"
            aria-label="Colapsar menú"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  )
}
