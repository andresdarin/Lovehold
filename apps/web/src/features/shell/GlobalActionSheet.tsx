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
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <h3 className="text-base font-bold text-foreground">Nuevo Movimiento</h3>
                  <p className="text-xs text-muted-foreground">Elegí el tipo de registro</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-muted-foreground hover:bg-surface-soft hover:text-foreground transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action Grid */}
              <div className="mt-4 grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => handleAction('expense')}
                  className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-surface-soft/60 p-3.5 text-left transition hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ArrowDown className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">Gasto</p>
                    <p className="text-xs text-muted-foreground">Registrar una compra o pago manual</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('scan')}
                  className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-surface-soft/60 p-3.5 text-left transition hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ScanLine className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">Escanear ticket</p>
                    <p className="text-xs text-muted-foreground">Cargar ticket con lectura inteligente OCR</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('income')}
                  className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-surface-soft/60 p-3.5 text-left transition hover:border-emerald-500/40 hover:bg-emerald-500/5 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ArrowUp className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">Ingreso</p>
                    <p className="text-xs text-muted-foreground">Registrar cobro de sueldo u otros ingresos</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('transfer')}
                  className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-surface-soft/60 p-3.5 text-left transition hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ArrowLeftRight className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">Transferencia / Pago de Tarjeta</p>
                    <p className="text-xs text-muted-foreground">Mover fondos entre cuentas o cancelar deuda</p>
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
