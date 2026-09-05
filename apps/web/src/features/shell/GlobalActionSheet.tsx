'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ScanLine, ArrowUp, ArrowLeftRight, RefreshCw, X } from 'lucide-react'
import IncomeFormModal from '../personal-finance/IncomeFormModal'
import TransferFormModal from '../personal-finance/TransferFormModal'
import CurrencyExchangeModal from '../personal-finance/CurrencyExchangeModal'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'

interface GlobalActionSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalActionSheet({ isOpen, onClose }: GlobalActionSheetProps) {
  const router = useRouter()
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)

  const handleAction = (type: 'expense' | 'scan' | 'income' | 'transfer' | 'exchange') => {
    onClose()
    if (type === 'expense') {
      router.push('/expenses/new')
    } else if (type === 'scan') {
      router.push('/expenses/new?tab=scan')
    } else if (type === 'income') {
      setIsIncomeModalOpen(true)
    } else if (type === 'transfer') {
      setIsTransferModalOpen(true)
    } else if (type === 'exchange') {
      setIsExchangeModalOpen(true)
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
              className="fixed inset-0 bg-black/60"
            />

            {/* Bottom / Center Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-t-[2rem] sm:rounded-3xl bg-surface p-6 z-10 select-none pb-[calc(24px+env(safe-area-inset-bottom))]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <FinnicOwlIcon color="navy" className="h-5 w-5" />
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
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 gap-2.5 pt-4">
                {/* 1. Registrar Gasto */}
                <button
                  onClick={() => handleAction('expense')}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/60 bg-surface hover:bg-surface-soft active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
                    <ArrowUp className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Registrar Gasto</p>
                    <p className="text-xs text-muted-foreground truncate">Cargá un egreso manual con monto y categoría</p>
                  </div>
                </button>

                {/* 2. Escanear Ticket */}
                <button
                  onClick={() => handleAction('scan')}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-[#407E8C]/30 bg-[#407E8C]/5 hover:bg-[#407E8C]/10 active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#407E8C] text-white shadow-xs group-hover:scale-105 transition-transform">
                    <ScanLine className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground">Escanear Ticket</p>
                      <span className="rounded-full bg-[#407E8C]/15 px-2 py-0.5 text-[10px] font-bold text-[#407E8C] dark:text-[#C0D5D6]">IA</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">Extraé datos automáticamente con cámara o foto</p>
                  </div>
                </button>

                {/* 3. Registrar Ingreso */}
                <button
                  onClick={() => handleAction('income')}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/60 bg-surface hover:bg-surface-soft active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success shadow-xs group-hover:scale-105 transition-transform">
                    <ArrowDown className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Registrar Ingreso</p>
                    <p className="text-xs text-muted-foreground truncate">Sueldo, honorarios, ventas u otros cobros</p>
                  </div>
                </button>

                {/* 4. Transferencia */}
                <button
                  onClick={() => handleAction('transfer')}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/60 bg-surface hover:bg-surface-soft active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-foreground shadow-xs group-hover:scale-105 transition-transform">
                    <ArrowLeftRight className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Transferencia entre cuentas</p>
                    <p className="text-xs text-muted-foreground truncate">Movimiento de fondos sin impacto en tus gastos</p>
                  </div>
                </button>

                {/* 5. Cambio de Moneda */}
                <button
                  onClick={() => handleAction('exchange')}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/60 bg-surface hover:bg-surface-soft active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A58D66]/15 text-[#A58D66] shadow-xs group-hover:scale-105 transition-transform">
                    <RefreshCw className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Compra / Venta de Moneda</p>
                    <p className="text-xs text-muted-foreground truncate">Arbitraje de divisas UYU / USD con tipo de cambio</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modales de Ingreso, Transferencia y Cambio */}
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />
      <TransferFormModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
      <CurrencyExchangeModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />
    </>
  )
}
