'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

export default function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className={`flex h-14 items-center rounded-full border border-border bg-surface-soft/60 ${collapsed ? 'justify-center' : 'gap-3 pl-3 pr-2'}`}>
      {collapsed ? (
        <button
          onClick={onToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          title="Expandir menú"
          aria-label="Expandir menú"
        >
          <img
            src="/brand/finnic-symbol-navy.png"
            alt="Finnic logo"
            className="h-7 w-7 object-contain"
          />
        </button>
      ) : (
        <>
          <img
            src="/brand/finnic-symbol-navy.png"
            alt="Finnic logo"
            className="h-7 w-7 shrink-0 object-contain"
          />
          <span className="text-base font-bold tracking-tight text-foreground">
            Finnic
          </span>
          <button
            onClick={onToggle}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
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
