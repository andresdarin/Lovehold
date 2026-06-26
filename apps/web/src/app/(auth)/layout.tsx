'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

/**
 * Layout persistente de autenticación.
 * Mantiene la experiencia de escritorio original con transiciones de ilustración,
 * y aplica una versión optimizada responsiva para mobile/PWA.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSignUp = pathname === '/signup'
  const activeState = isSignUp ? 'signup' : 'login'

  // Variantes de animación para la ilustración en Desktop
  const desktopImageVariants = {
    initial: {
      left: '50%',
      x: '-50%',
      top: '50%',
      y: '-50%',
      width: '280px',
      height: '280px',
      borderRadius: '50%',
      scale: 0.8,
      boxShadow: '0 25px 50px -12px rgba(45, 37, 95, 0.25)',
    },
    login: {
      left: '38vw',
      x: '0%',
      top: '0%',
      y: '0%',
      width: '62vw',
      height: '100%',
      borderTopLeftRadius: '38% 50%',
      borderBottomLeftRadius: '38% 50%',
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
      scale: 1,
      boxShadow: '0 0px 0px rgba(0,0,0,0)',
    },
    signup: {
      left: '0vw',
      x: '0%',
      top: '0%',
      y: '0%',
      width: '62vw',
      height: '100%',
      borderTopRightRadius: '38% 50%',
      borderBottomRightRadius: '38% 50%',
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
      scale: 1,
      boxShadow: '0 0px 0px rgba(0,0,0,0)',
    },
  }

  const springTransition = {
    type: 'spring' as const,
    stiffness: 85,
    damping: 17,
    mass: 1,
  }

  return (
    <div className="min-h-screen bg-lh-cream overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      {/* ═══════════ DESKTOP LAYOUT (lg) ═══════════ */}
      <div className="hidden min-h-screen lg:relative lg:flex lg:items-center">
        {/* Contenedor flotante de los formularios */}
        <div className="relative z-10 w-full min-h-screen flex items-center pointer-events-none [&>*]:pointer-events-auto">
          {children}
        </div>

        {/* Ilustración compartida con Morphing y Shared-Element */}
        <motion.div
          variants={desktopImageVariants}
          initial="initial"
          animate={activeState}
          transition={springTransition}
          className="absolute overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: 'url(/brand/lovehold-bg.png)',
            zIndex: 5,
          }}
        />
      </div>

      {/* ═══════════ MOBILE LAYOUT (< lg) ═══════════ */}
      <div className="flex min-h-[100dvh] flex-col lg:hidden bg-black text-white pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        {/* Cabecera con ilustración fina y degradado inferior lineal simple */}
        <div className="w-full h-[clamp(110px,15dvh,140px)] shrink-0 overflow-hidden relative">
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            src="/brand/lovehold-bg.png"
            alt="Lovehold Background"
            className="h-full w-full object-cover"
          />
          {/* Overlay oscuro general */}
          <div className="absolute inset-0 bg-black/25" />
          
          {/* Degradado inferior recto para fundir con el fondo negro */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Contenedor del Formulario en Mobile */}
        <div className="flex-1 flex flex-col bg-black px-6">
          <div className="mx-auto w-full max-w-[390px] flex-1 flex flex-col justify-between">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
