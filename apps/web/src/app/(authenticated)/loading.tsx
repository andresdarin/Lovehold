'use client'

import React from 'react'
import FeatherLoading from '@/components/ui/FeatherLoading'

export default function AuthenticatedLoading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
      <FeatherLoading
        variant="card"
        message="Actualizando finanzas…"
        subtitle="Un momento mientras preparamos tus datos"
      />
    </div>
  )
}
