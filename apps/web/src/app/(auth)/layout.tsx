'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

/**
 * Layout persistente de autenticación.
 * Maneja la transición conceptual tipo shared-element y morphing
 * de la ilustración de fondo entre Login y Registro.
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
    <div className="min-h-screen bg-lh-cream overflow-hidden">
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
      <div className="flex min-h-screen flex-col lg:hidden">
        {/* Cabecera con ilustración animada sutilmente */}
        <div className="h-[200px] shrink-0 overflow-hidden relative">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            src="/brand/lovehold-bg.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Formulario */}
        <div className="relative -mt-8 flex flex-1 flex-col rounded-t-[32px] bg-lh-cream px-6 py-8">
          <div className="mx-auto w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
