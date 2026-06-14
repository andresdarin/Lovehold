'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { useEditProfile } from './hooks'

interface EditProfileModalProps {
  open: boolean
  currentName: string | null
  onClose: () => void
  onSaved: () => void
}

export function EditProfileModal({ open, currentName, onClose, onSaved }: EditProfileModalProps) {
  const [name, setName] = useState(currentName ?? '')
  const { saving, error, success, update, reset } = useEditProfile()

  useEffect(() => {
    if (open) {
      setName(currentName ?? '')
      reset()
    }
  }, [open, currentName, reset])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        onSaved()
        onClose()
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [success, onSaved, onClose])

  if (!open) return null

  const isValid = name.trim().length > 0 && name.length <= 60
  const canSave = isValid && !saving && !success

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    update({ displayName: name.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <LiquidGlass variant="card" intensity="medium" className="relative z-10 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Editar perfil</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-soft transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre visible
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-border bg-surface-soft px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {name.length}/60 caracteres
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-soft p-3">
            <p className="text-xs text-muted-foreground">Correo electrónico</p>
            <p className="text-sm font-semibold text-foreground/60">No editable desde aquí</p>
          </div>

          {error && (
            <p className="text-sm text-danger flex items-center gap-1.5">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-success flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Perfil actualizado
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition hover:bg-surface-soft"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </span>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </LiquidGlass>
    </div>
  )
}
