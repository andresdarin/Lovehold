'use client'

import { Mail, LogOut, ShieldCheck } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'

interface AccountCardProps {
  email: string | undefined
  onLogout: () => void
}

export function AccountCard({ email, onLogout }: AccountCardProps) {
  return (
    <LiquidGlass variant="card" intensity="medium" className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Cuenta</h3>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft/50 p-3">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Correo electrónico</p>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft/50 p-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Estado de sesión</p>
            <p className="text-sm font-medium text-success">Sesión activa</p>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </LiquidGlass>
  )
}
