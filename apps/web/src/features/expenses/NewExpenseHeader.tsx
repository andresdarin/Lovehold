'use client'

import Link from 'next/link'
import { ArrowLeft, ReceiptText } from 'lucide-react'
import ReceiptScanUploader from './receipt-scan/ReceiptScanUploader'

export default function NewExpenseHeader({
  preview,
  scanning,
  onFileSelect,
  onScan,
  onClear,
  autoCamera,
}: {
  preview?: string | null
  scanning?: boolean
  onFileSelect?: (file: File | null) => void
  onScan?: () => void
  onClear?: () => void
  autoCamera?: boolean
}) {
  return (
    <header className="relative w-full bg-primary text-primary-foreground pt-[calc(1rem+env(safe-area-inset-top))] pb-7 px-4 sm:px-6 rounded-b-[2rem] sm:rounded-b-[2.5rem] shadow-lg select-none overflow-hidden flex flex-col gap-4">
      {/* Luces ambientales sutiles */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#A58D66]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#C0D5D6]/15 blur-2xl" />

      {/* Barra superior del Header */}
      <div className="relative mx-auto flex w-full max-w-xl items-center justify-between">
        {/* Botón Volver */}
        <Link
          href="/expenses"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 shadow-xs focus:outline-none"
          aria-label="Volver a movimientos"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
        </Link>
        
        {/* Título & Subtítulo */}
        <div className="text-center flex-1 px-3">
          <h1 className="text-sm sm:text-base font-extrabold text-[#F5F2EE] tracking-tight">
            Escanear ticket
          </h1>
          <p className="text-[11px] text-[#C0D5D6] mt-0.5 font-medium">
            Revisá y confirmá el egreso
          </p>
        </div>

        {/* Icono Contextual */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A58D66]/40 bg-[#A58D66]/20 text-[#E5E1DD] shadow-xs">
          <ReceiptText className="h-4 w-4 stroke-[2]" />
        </div>
      </div>

      {/* Bloque 'Capturar comprobante' integrado dentro del Banner Azul */}
      {onFileSelect && onScan && onClear && (
        <div className="relative mx-auto w-full max-w-xl">
          <ReceiptScanUploader
            preview={preview ?? null}
            scanning={scanning ?? false}
            onFileSelect={onFileSelect}
            onScan={onScan}
            onClear={onClear}
            autoCamera={autoCamera}
            inBanner
          />
        </div>
      )}
    </header>
  )
}
