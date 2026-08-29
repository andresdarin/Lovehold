'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ScanLine, ArrowUp, ArrowLeftRight, X } from 'lucide-react'
import IncomeFormModal from '../personal-finance/IncomeFormModal'
import TransferFormModal from '../personal-finance/TransferFormModal'

interface GlobalActionSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalActionSheet({ isOpen, onClose }: GlobalActionSheetProps) {
  const router = useRouter()
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const handleAction = (type: 'expense' | 'scan' | 'income' | 'transfer') => {
    onClose()
    if (type === 'expense') {
      router.push('/expenses/new')
    } else if (type === 'scan') {
      router.push('/expenses/new?tab=scan')
    } else if (type === 'income') {
      setIsIncomeModalOpen(true)
    } else if (type === 'transfer') {
      setIsTransferModalOpen(true)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom / Center Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-t-[2rem] sm:rounded-3xl border border-border bg-surface p-6 shadow-2xl z-10 select-none pb-[calc(24px+env(safe-area-inset-bottom))]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/brand/finnic-symbol-navy.png"
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-foreground">Nuevo Registro</h3>
                    <p className="text-[11px] text-muted-foreground">Elegí la operación a realizar</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-soft hover:text-foreground transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action Grid Minimalista */}
              <div className="mt-3.5 grid grid-cols-1 gap-2">
                {/* 1. Egreso (Principal) */}
                <button
                  onClick={() => handleAction('expense')}
                  className="group flex items-center gap-3.5 rounded-2xl border border-border/70 bg-surface-soft/40 p-3 text-left transition-all hover:border-primary/40 hover:bg-surface-soft active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent transition-colors group-hover:border-primary/60 group-hover:bg-primary/5">
                    <ArrowUp className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">Egreso</p>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Manual</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Registrar compra o gasto realizado</p>
                  </div>
                </button>

                {/* 2. Ingreso */}
                <button
                  onClick={() => handleAction('income')}
                  className="group flex items-center gap-3.5 rounded-2xl border border-border/70 bg-surface-soft/40 p-3 text-left transition-all hover:border-emerald-500/40 hover:bg-surface-soft active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 text-emerald-400 bg-transparent transition-colors group-hover:border-emerald-500/60 group-hover:bg-emerald-500/5">
                    <ArrowDown className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">Ingreso</p>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">+ Balance</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Cobro de sueldo, honorarios o depósito</p>
                  </div>
                </button>

                {/* 3. Escanear ticket */}
                <button
                  onClick={() => handleAction('scan')}
                  className="group flex items-center gap-3.5 rounded-2xl border border-[#407E8C]/25 bg-[#407E8C]/5 p-3 text-left transition-all hover:border-[#407E8C]/50 hover:bg-[#407E8C]/10 active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#407E8C]/40 text-[#407E8C] dark:text-[#C0D5D6] bg-transparent transition-colors group-hover:border-[#407E8C]/70 group-hover:bg-[#407E8C]/10">
                    <ScanLine className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">Escanear ticket</p>
                      <span className="text-[10px] font-semibold text-[#407E8C] dark:text-[#C0D5D6] uppercase tracking-wide">OCR Inteligente</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Lectura automática de ticket o factura</p>
                  </div>
                </button>

                {/* 4. Transferencia */}
                <button
                  onClick={() => handleAction('transfer')}
                  className="group flex items-center gap-3.5 rounded-2xl border border-border/70 bg-surface-soft/40 p-3 text-left transition-all hover:border-primary/40 hover:bg-surface-soft active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground bg-transparent transition-colors group-hover:border-primary/40 group-hover:text-primary">
                    <ArrowLeftRight className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">Transferencia / Tarjeta</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Mover fondos o saldar tarjeta de crédito</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Modals */}
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSuccess={() => {
          router.refresh()
        }}
      />

      <TransferFormModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </>
  )
}
