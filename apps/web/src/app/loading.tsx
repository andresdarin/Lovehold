'use client'

import React from 'react'
import FeatherLoading from '@/components/ui/FeatherLoading'

export default function Loading() {
  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4">
      <FeatherLoading
        variant="fullscreen"
        message="Cargando tu espacio…"
        subtitle="Sincronizando finanzas y movimientos"
      />
    </main>
  )
}
