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
      className={`relative flex h-10 w-10 items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/45 ${
        isDock
          ? 'rounded-full border border-white/60 bg-white/40 text-[#2D255F] hover:bg-white/70 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.12]'
          : 'rounded-xl border border-border bg-surface text-foreground hover:bg-surface-soft'
      }`}
      aria-label="Alternar tema"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center justify-center ${isDock ? 'text-primary' : 'text-primary'}`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
