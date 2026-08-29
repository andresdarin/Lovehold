'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../theme/ThemeProvider'

interface ThemeToggleProps {
  variant?: 'surface' | 'dock'
}

/**
 * Toggle de tema animado (Sol / Luna) para alternar entre el modo claro y oscuro.
 */
export default function ThemeToggle({ variant = 'surface' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDock = variant === 'dock'

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-9 w-9 items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/45 ${
        isDock
          ? 'rounded-full border border-border bg-surface text-foreground hover:bg-surface-soft'
          : 'rounded-xl border border-border bg-surface text-foreground hover:bg-surface-soft'
      }`}
      aria-label="Alternar tema"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -6, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 6, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center text-primary"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
