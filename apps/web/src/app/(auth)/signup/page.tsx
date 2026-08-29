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
        {/* Branding Block */}
        <div className="flex flex-col items-center text-center -mt-8 lg:mt-0 z-10 relative">
          <img
            src="/icons/favicon.png"
            alt="Lovehold"
            className="h-12 w-12 lg:h-14 lg:w-14 mx-auto focus:outline-none drop-shadow-xs"
          />

          <h1 className="mt-2.5 text-center text-2xl lg:text-4xl font-extrabold leading-tight text-foreground tracking-tight">
            Welcome to
            <br />
            L<span
              className="inline-flex items-center justify-center w-[0.72em] leading-none"
              style={{ height: '1em' }}
            >
              <Heart
                className="block h-[0.62em] w-[0.62em] text-primary stroke-[3.5px] translate-y-[0.04em]"
                style={{ display: 'block' }}
              />
            </span>vehold
          </h1>

          <p className="mt-1.5 text-center text-xs lg:text-sm text-muted-foreground max-w-[280px] lg:max-w-none">
            Compartan todo. Lleven cuentas de lo que importa.
          </p>
        </div>

        <h2 className="mt-4 lg:mt-6 text-center text-base lg:text-lg font-bold text-foreground">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 lg:mt-5 flex flex-col gap-3">
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-xs font-semibold text-muted-foreground hidden lg:block"
            >
              Nombre visible
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="displayName"
                type="text"
                required
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nombre visible"
                className="w-full h-12 text-sm rounded-2xl border border-border bg-surface pl-11 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold text-muted-foreground hidden lg:block"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-12 text-sm rounded-2xl border border-border bg-surface pl-11 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold text-muted-foreground hidden lg:block"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full h-12 text-sm rounded-2xl border border-border bg-surface pl-11 pr-12 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-xs font-semibold text-muted-foreground hidden lg:block"
            >
              Repetir contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetir contraseña"
                className="w-full h-12 text-sm rounded-2xl border border-border bg-surface pl-11 pr-12 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-xs font-semibold text-muted-foreground hidden lg:block"
            >
              Teléfono (opcional)
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full h-12 text-sm rounded-2xl border border-border bg-surface pl-11 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-xs font-medium text-danger">
              {error}
            </p>
          )}

          {emailConfirmMessage && (
            <p className="rounded-2xl border border-border bg-surface-soft px-4 py-3 text-xs text-foreground">
              {emailConfirmMessage}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 py-1 lg:py-2" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <Heart className="h-4 w-4 text-primary/40" />
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <div className="mt-4 lg:mt-6 shrink-0">
        <p className="text-center text-xs text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
