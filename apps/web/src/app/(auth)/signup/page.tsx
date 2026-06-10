'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'

/**
 * Vista de Sign Up (Registro).
 * Renderiza el formulario unificado (responsivo) con transiciones coordinadas con la ilustración.
 */
export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailConfirmMessage, setEmailConfirmMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailConfirmMessage(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, phone } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const session = data.session

    if (!session) {
      setEmailConfirmMessage('Revisá tu email para confirmar la cuenta antes de iniciar sesión.')
      setLoading(false)
      return
    }

    try {
      await apiFetch('/api/profiles/ensure', {
        method: 'POST',
        body: JSON.stringify({ displayName }),
      }, session.access_token)

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el perfil')
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.98 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm lg:max-w-[460px] lg:w-[40vw] lg:mr-[72px] lg:ml-auto mx-auto"
    >
      <img
        src="/icons/favicon.png"
        alt="Lovehold"
        className="h-16 w-16 mx-auto focus:outline-none"
      />

      <h1 className="mt-6 text-center text-4xl lg:text-5xl font-bold leading-tight text-[#2D255F]">
        Welcome to
        <br />
        L<span
          className="inline-flex items-center justify-center w-[0.72em] leading-none"
          style={{ height: '1em' }}
        >
          <Heart
            className="block h-[0.62em] w-[0.62em] text-[#FF6B6B] stroke-[3.5px] translate-y-[0.04em]"
            style={{ display: 'block' }}
          />
        </span>vehold
      </h1>

      <p className="mt-2 lg:mt-6 text-center text-lg text-[#2D255F]/60">
        Compartan todo. Lleven cuentas de lo que importa.
      </p>

      <h2 className="mt-6 text-center text-xl font-semibold text-[#2D255F]">
        Crear cuenta
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-2 block text-sm font-medium text-[#2D255F]/70"
          >
            Nombre visible
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
            <input
              id="displayName"
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/40 outline-none transition-all focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/40 focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#2D255F]/70"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/40 outline-none transition-all focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/40 focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#2D255F]/70"
          >
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mín. 6 caracteres"
              className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/40 outline-none transition-all focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/40 focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-[#2D255F]/70"
          >
            Repetir contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
              className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/40 outline-none transition-all focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/40 focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-[#2D255F]/70"
          >
            Teléfono (opcional)
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 11 1234-5678"
              className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/40 outline-none transition-all focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/40 focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/40"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FF6B6B]">
            {error}
          </p>
        )}

        {emailConfirmMessage && (
          <p className="rounded-xl border border-[#2D255F]/10 bg-[#2D255F]/5 px-4 py-3 text-sm text-[#2D255F]/70">
            {emailConfirmMessage}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 py-1" aria-hidden="true">
          <span className="h-px flex-1 bg-[#2D255F]/[0.06]" />
          <Heart className="h-5 w-5 text-[#FF6B6B]/25" />
          <span className="h-px flex-1 bg-[#2D255F]/[0.06]" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF3D8B] py-[14px] font-semibold text-white shadow-lg shadow-[#FF6B6B]/25 transition-all hover:shadow-xl hover:shadow-[#FF6B6B]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#2D255F]/50">
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          className="rounded font-medium text-[#FF6B6B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/50 focus-visible:ring-offset-2"
        >
          Iniciar sesión
        </Link>
      </p>
    </motion.div>
  )
}
