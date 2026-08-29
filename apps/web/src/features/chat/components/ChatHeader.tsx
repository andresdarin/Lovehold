'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function ChatHeader() {
  return (
    <header className="relative w-full bg-primary text-primary-foreground pt-4 pb-5 px-4 sm:px-6 rounded-b-[2rem] sm:rounded-b-[2.2rem] shadow-md select-none overflow-hidden shrink-0">
      {/* Luz ambiental sutil */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#A58D66]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C0D5D6]/15 blur-xl" />

      <div className="relative mx-auto flex max-w-xl items-center justify-between">
        {/* Botón Volver */}
        <Link
          href="/dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 shadow-xs focus:outline-none"
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A58D66]/40 bg-[#A58D66]/20 text-[#E5E1DD] shadow-xs">
          <Sparkles className="h-4 w-4 stroke-[2]" />
        </div>
      </div>
    </header>
  )
}
