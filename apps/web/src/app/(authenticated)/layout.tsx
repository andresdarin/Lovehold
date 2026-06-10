'use client'

import React from 'react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ProfileProvider } from '@/components/auth/ProfileProvider'

/**
 * Layout común para el route group autenticado.
 * Encapsula la lógica de sesiones, datos de perfil y la gestión de temas.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </ThemeProvider>
  )
}
