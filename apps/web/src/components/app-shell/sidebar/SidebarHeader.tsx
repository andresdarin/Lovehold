'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

export default function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
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
  )
}
