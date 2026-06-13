'use client'

import React from 'react'
import { User } from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'

export default function ProfilePage() {
  const { profile } = useProfile()

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-soft border border-border">
          <User className="h-5 w-5 text-foreground/80" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-muted-foreground">Tus datos personales</p>
        </div>
      </header>

      <section className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: profile?.color ?? '#FF6B6B' }}
        >
          {(profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">
            {profile?.displayName ?? 'Sin nombre'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.email}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <div className="rounded-xl border border-border bg-surface-soft p-3">
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p className="text-sm font-semibold text-foreground">{profile?.displayName ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-soft p-3">
            <p className="text-xs text-muted-foreground">Correo electrónico</p>
            <p className="text-sm font-semibold text-foreground">{profile?.email}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
