'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { AuthBackground } from '@/features/auth/AuthComponents'
import ThemeToggle from '@/features/shell/ThemeToggle'

/**
 * Layout unificado para autenticación en Finnic.
 * Mantiene la armonía visual Navy + Sand + Gold con soporte para safe areas,
 * dynamic viewport heights (100dvh), gestión de tema (ThemeProvider) y selector superior.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <ThemeProvider>
      <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-x-hidden bg-background text-foreground selection:bg-accent/30">
        {/* Background fotográfico integrado con overlays cromáticos Navy/Sand */}
        <AuthBackground />

        {/* Botón superior de ThemeToggle accesible y alineado */}
        <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-4 sm:right-6 z-20">
          <ThemeToggle variant="auth" />
        </div>

        {/* Contenedor central con soporte para Safe Areas y Teclado Mobile */}
        <main className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-16 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full max-w-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
