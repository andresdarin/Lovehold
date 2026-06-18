'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Heart, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { APP_VERSION } from '@/lib/version'

/**
 * Vista de Login.
 * Renderiza el formulario unificado (responsivo) con transiciones coordinadas con la ilustración.
 */
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const session = data.session

    if (!session) {
      setError('No se pudo obtener la sesión. Revisá tus credenciales.')
      setLoading(false)
      return
    }

    try {
      await apiFetch('/api/profiles/ensure', {
        method: 'POST',
        body: JSON.stringify({}),
      }, session.access_token)

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.98 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm lg:max-w-[460px] lg:w-[40vw] lg:ml-[72px] lg:mr-0 mx-auto"
    >
      <img
        src="/icons/favicon.png"
        alt="Lovehold"
        className="h-16 w-16 mx-auto focus:outline-none"
      />

      <h1 className="mt-6 text-center text-4xl lg:text-5xl font-bold leading-tight text-lh-navy">
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

      <p className="mt-2 lg:mt-6 text-center text-lg text-lh-navy/60">
        Compartan todo. Lleven cuentas de lo que importa.
      </p>

      <h2 className="mt-6 text-center text-xl font-semibold text-lh-navy">
        Iniciar sesión
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-lh-navy/70"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-navy/40" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-lh-border-light bg-lh-surface py-3.5 pl-11 pr-4 text-lh-navy placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-lh-navy/70"
          >
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lh-navy/40" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-lh-border-light bg-lh-surface py-3.5 pl-11 pr-12 text-lh-navy placeholder:text-lh-navy/40 outline-none transition-all focus:border-lh-primary focus:ring-2 focus:ring-lh-primary/40 focus-visible:ring-2 focus-visible:ring-lh-primary/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lh-navy/40 hover:text-lh-navy/70 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-lh-primary/20 bg-lh-primary/10 px-4 py-3 text-sm text-lh-primary">
            {error}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 py-3" aria-hidden="true">
          <span className="h-px flex-1 bg-lh-navy/[0.06]" />
          <Heart className="h-6 w-6 text-lh-primary/25" />
          <span className="h-px flex-1 bg-lh-navy/[0.06]" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-lh-primary to-lh-primary-rose py-[14px] font-semibold text-white shadow-lg shadow-lh-primary/25 transition-all hover:shadow-xl hover:shadow-lh-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lh-primary/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-lh-navy/50">
        ¿No tenés cuenta?{' '}
        <Link
          href="/signup"
          className="rounded font-medium text-lh-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lh-primary/50 focus-visible:ring-offset-2"
        >
          Registrate
        </Link>
      </p>
      <p className="mt-6 text-center text-xs text-lh-navy/30">
        v{APP_VERSION}
      </p>
    </motion.div>
  )
}
