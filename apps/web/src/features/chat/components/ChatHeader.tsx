'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'
import BannerFeatherPattern from '@/components/ui/BannerFeatherPattern'

export default function ChatHeader() {
  return (
    <header className="relative w-full bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] text-[#F5F2EE] pt-[calc(.65rem+env(safe-area-inset-top))] pb-3.5 px-3 sm:px-6 sm:pt-[calc(1rem+env(safe-area-inset-top))] sm:pb-5 rounded-b-[1.4rem] sm:rounded-b-[2.2rem] select-none overflow-hidden shrink-0 shadow-md">
      {/* Plumas de fondo estáticas sutiles */}
      <BannerFeatherPattern />

      {/* Luz ambiental sutil */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#A58D66]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C0D5D6]/15 blur-xl" />

      <div className="relative mx-auto flex max-w-xl items-center justify-between">
        {/* Botón Volver */}
        <Link
          href="/dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F5F2EE] transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
          aria-label="Volver al dashboard"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
        </Link>
        
        {/* Identidad de Finnic centrada */}
        <div className="text-center flex-1 px-3 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[13px] font-extrabold tracking-tight sm:text-base">
              Finnic
            </h1>
            <span className="flex h-2 w-2 rounded-full bg-[#C0D5D6] animate-pulse" />
          </div>
          <p className="text-[10px] font-medium text-[#C0D5D6] sm:text-[11px]">
            Tu copiloto financiero
          </p>
        </div>

        {/* Icono contextual */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sand sm:h-9 sm:w-9">
          <FinnicOwlIcon color="cream" className="h-5 w-5" />
        </div>
      </div>
    </header>
  )
}
