'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { AuthBackground } from '@/features/auth/AuthBackground'
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
        <div className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] right-[max(1rem,calc(env(safe-area-inset-right)+1rem))] z-20">
          <ThemeToggle variant="auth" />
        </div>

        {/* Contenedor central con soporte para Safe Areas y Teclado Mobile */}
        <main className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-center px-[max(1rem,calc(env(safe-area-inset-left)+1rem))] py-6 sm:px-6 sm:py-10 md:py-14 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))] pr-[max(1rem,calc(env(safe-area-inset-right)+1rem))] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))]">
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
