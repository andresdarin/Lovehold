'use client'

import React from 'react'
import { Clock3, Bell } from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'

export default function MovementsHeader() {
  const { profile } = useProfile()

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
    <header className="relative w-full overflow-hidden bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] dark:from-[#04141D] dark:via-[#061D27] dark:to-[#051720] pt-[calc(0.5rem+env(safe-area-inset-top))] pb-6 sm:pb-8 px-4 sm:px-6 md:px-8 rounded-b-[2rem] sm:rounded-b-[2.5rem] border-b border-black/10 dark:border-white/[0.06] shadow-[0_12px_30px_rgba(8,58,79,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
      {/* Luces de ambiente sutiles */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#407E8C]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-[#A58D66]/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 sm:gap-5">
        {/* TopBar Integrada (Logo + Notificación + Avatar) */}
        <div className="flex items-center justify-between pb-1 select-none">
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

        {/* Título y Eyebrow */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#A58D66]/40 text-[#A58D66] bg-transparent">
              <Clock3 className="h-3.5 w-3.5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
              Historial de movimientos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F2EE]">
            Movimientos
          </h1>
          <p className="text-xs text-[#C0D5D6]/70">
            Cronología de ingresos, egresos, transferencias y cambios de divisa
          </p>
        </div>
      </div>
    </header>
  )
}
