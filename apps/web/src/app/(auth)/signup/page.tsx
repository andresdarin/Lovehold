'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, Heart, Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      className="w-full max-w-sm lg:max-w-[460px] lg:w-[40vw] lg:mr-[72px] lg:ml-auto mx-auto flex-1 flex flex-col justify-between h-full lg:h-auto"
    >
      <div className="flex-1 flex flex-col justify-center">
        {/* Branding Block (Superpuesto en mobile con margen negativo sobre el hero fino) */}
        <div className="flex flex-col items-center text-center -mt-10 lg:mt-0 z-10 relative">
          <img
            src="/icons/favicon.png"
            alt="Lovehold"
            className="h-14 w-14 lg:h-16 lg:w-16 mx-auto focus:outline-none drop-shadow-[0_4px_12px_rgba(255,107,107,0.25)]"
          />

          <h1 className="mt-2.5 text-center text-[clamp(1.8rem,7vw,2.4rem)] lg:text-4xl xl:text-5xl font-bold leading-tight text-white lg:text-lh-navy tracking-wide">
            Welcome to
            <br />
            L<span
              className="inline-flex items-center justify-center w-[0.72em] leading-none"
              style={{ height: '1em' }}
            >
              <Heart
                className="block h-[0.62em] w-[0.62em] text-lh-primary stroke-[3.5px] translate-y-[0.04em]"
                style={{ display: 'block' }}
              />
            </span>vehold
          </h1>

          <p className="mt-1.5 text-center text-xs lg:text-lg text-neutral-400 lg:text-lh-navy/60 max-w-[280px] lg:max-w-none">
            Compartan todo. Lleven cuentas de lo que importa.
          </p>
        </div>

        <h2 className="mt-4 lg:mt-6 text-center text-base lg:text-xl font-semibold text-white lg:text-lh-navy">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 lg:mt-6 flex flex-col gap-3 lg:gap-4">
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-xs lg:text-sm font-medium text-lh-navy/70 hidden lg:block"
            >
              Nombre visible
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-primary lg:text-lh-navy/40" />
              <input
                id="displayName"
                type="text"
                required
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nombre visible"
                className="w-full h-[48px] lg:h-[54px] text-base rounded-xl border border-white/10 lg:border-lh-border-light bg-white/5 lg:bg-lh-surface pl-11 pr-4 text-white lg:text-lh-navy placeholder:text-neutral-500 lg:placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs lg:text-sm font-medium text-lh-navy/70 hidden lg:block"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-primary lg:text-lh-navy/40" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-[48px] lg:h-[54px] text-base rounded-xl border border-white/10 lg:border-lh-border-light bg-white/5 lg:bg-lh-surface pl-11 pr-4 text-white lg:text-lh-navy placeholder:text-neutral-500 lg:placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs lg:text-sm font-medium text-lh-navy/70 hidden lg:block"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-primary lg:text-lh-navy/40" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full h-[48px] lg:h-[54px] text-base rounded-xl border border-white/10 lg:border-lh-border-light bg-white/5 lg:bg-lh-surface pl-11 pr-12 text-white lg:text-lh-navy placeholder:text-neutral-500 lg:placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 lg:text-lh-navy/40 hover:text-white lg:hover:text-lh-navy/70 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-xs lg:text-sm font-medium text-lh-navy/70 hidden lg:block"
            >
              Repetir contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-primary lg:text-lh-navy/40" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetir contraseña"
                className="w-full h-[48px] lg:h-[54px] text-base rounded-xl border border-white/10 lg:border-lh-border-light bg-white/5 lg:bg-lh-surface pl-11 pr-12 text-white lg:text-lh-navy placeholder:text-neutral-500 lg:placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 lg:text-lh-navy/40 hover:text-white lg:hover:text-lh-navy/70 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-xs lg:text-sm font-medium text-lh-navy/70 hidden lg:block"
            >
              Teléfono (opcional)
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-primary lg:text-lh-navy/40" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full h-[48px] lg:h-[54px] text-base rounded-xl border border-white/10 lg:border-lh-border-light bg-white/5 lg:bg-lh-surface pl-11 pr-4 text-white lg:text-lh-navy placeholder:text-neutral-500 lg:placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-lh-primary/20 bg-lh-primary/10 px-4 py-3 text-sm text-lh-primary">
              {error}
            </p>
          )}

          {emailConfirmMessage && (
            <p className="rounded-xl border border-lh-navy/10 bg-lh-navy/5 px-4 py-3 text-sm text-lh-navy/70">
              {emailConfirmMessage}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 py-1.5 lg:py-3" aria-hidden="true">
            <span className="h-px flex-1 bg-white/10 lg:bg-lh-navy/[0.06]" />
            <Heart className="h-4 w-4 lg:h-6 w-6 text-lh-primary/40" />
            <span className="h-px flex-1 bg-white/10 lg:bg-lh-navy/[0.06]" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] lg:h-[54px] flex items-center justify-center rounded-xl bg-gradient-to-r from-lh-primary to-lh-primary-rose font-semibold text-white shadow-lg shadow-lh-primary/25 transition-all hover:shadow-xl hover:shadow-lh-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lh-primary/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <div className="mt-6 lg:mt-8 shrink-0">
        <p className="text-center text-sm text-neutral-400 lg:text-lh-navy/50">
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            className="rounded font-medium text-lh-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lh-primary/50 focus-visible:ring-offset-2"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
