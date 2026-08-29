'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import { monthLabel } from './constants'

interface FinanzasHeroProps {
  profile: {
    displayName: string | null
    email: string
    color: string
    avatarUrl?: string | null
  } | null
  monthKey: string
  onShiftMonth: (delta: number) => void
  totalSpent: number
}

export default function FinanzasHero({
  profile,
  monthKey,
  onShiftMonth,
  totalSpent,
}: FinanzasHeroProps) {
  const userInitial = (profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()
  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : userInitial

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] dark:from-[#04141D] dark:via-[#061D27] dark:to-[#051720] pt-[calc(0.5rem+env(safe-area-inset-top))] pb-7 sm:pb-9 px-4 sm:px-6 md:px-8 rounded-b-[2rem] sm:rounded-b-[2.5rem] border-b border-black/10 dark:border-white/[0.06] shadow-[0_12px_30px_rgba(8,58,79,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
      {/* Luces de ambiente sutiles */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#407E8C]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-[#A58D66]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl flex flex-col gap-4 sm:gap-5">
        {/* 1. Header superior (Logo + Notificación + Avatar) */}
        <div className="flex items-center justify-between pb-2 pt-1 select-none">
          <div className="flex items-center gap-2.5">
            <img
              src="/brand/finnic-symbol-cream.png"
              alt="Finnic logo"
              className="h-6 w-6 object-contain drop-shadow-[0_2px_8px_rgba(192,213,214,0.3)]"
            />
            <span className="text-base font-bold tracking-tight text-[#F5F2EE]">
              Finnic
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notificaciones"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[#C0D5D6] border border-white/8 backdrop-blur-md transition-all hover:bg-white/[0.12] hover:text-[#F5F2EE] active:scale-95 focus:outline-none"
              title="Notificaciones"
            >
              <Bell className="h-3.5 w-3.5 stroke-[2]" />
            </button>

            {profile && (
              <div className="relative shrink-0 select-none">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white text-xs shadow-xs overflow-hidden ring-1 ring-white/20"
                  style={{
                    background: `linear-gradient(135deg, ${profile.color ?? '#407E8C'}dd, #083A4F)`,
                  }}
                  title={profile.displayName ?? profile.email}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName ?? 'Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Selector de Período y Título */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
              Finanzas Personales
            </span>

            {/* Navegador de mes con estilo glass */}
            <div className="flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 backdrop-blur-sm">
              <button
                onClick={() => onShiftMonth(-1)}
                className="text-[#C0D5D6]/80 hover:text-white p-1 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-semibold text-[#F5F2EE] px-1.5 uppercase tracking-wide">
                {monthLabel(monthKey)}
              </span>
              <button
                onClick={() => onShiftMonth(1)}
                className="text-[#C0D5D6]/80 hover:text-white p-1 transition-colors"
                aria-label="Siguiente mes"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C0D5D6]/75">
              Gasto total registrado
            </span>
            <div className="mt-1 flex items-baseline justify-center">
              <span className="text-4xl font-extrabold tracking-tight text-[#F5F2EE] sm:text-5xl tabular-nums">
                ${totalSpent.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
