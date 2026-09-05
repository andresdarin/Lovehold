'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'
import BannerFeatherPattern from '@/components/ui/BannerFeatherPattern'

export default function ChatHeader() {
  return (
    <header className="relative w-full bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] dark:from-[#04141D] dark:via-[#061D27] dark:to-[#051720] text-[#F5F2EE] pt-[calc(1rem+env(safe-area-inset-top))] pb-5 px-4 sm:px-6 rounded-b-[2rem] sm:rounded-b-[2.2rem] select-none overflow-hidden shrink-0 border-b border-black/10 dark:border-white/[0.06] shadow-lg">
      {/* Plumas de fondo estáticas sutiles */}
      <BannerFeatherPattern />

      {/* Luz ambiental sutil */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#A58D66]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C0D5D6]/15 blur-xl" />

      <div className="relative mx-auto flex max-w-xl items-center justify-between">
        {/* Botón Volver */}
        <Link
          href="/dashboard"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#F5F2EE] transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Volver al dashboard"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
        </Link>
        
        {/* Identidad de Finnic centrada */}
        <div className="text-center flex-1 px-3 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm sm:text-base font-extrabold text-[#F5F2EE] tracking-tight">
              Finnic
            </h1>
            <span className="flex h-2 w-2 rounded-full bg-[#C0D5D6] animate-pulse" />
          </div>
          <p className="text-[11px] text-[#C0D5D6] font-medium">
            Tu copiloto financiero
          </p>
        </div>

        {/* Icono contextual */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/20 text-sand">
          <FinnicOwlIcon color="cream" className="h-5.5 w-5.5" />
        </div>
      </div>
    </header>
  )
}
