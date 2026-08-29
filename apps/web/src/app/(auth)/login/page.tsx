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
      className="w-full max-w-sm lg:max-w-[460px] lg:w-[40vw] lg:ml-[72px] lg:mr-0 mx-auto flex-1 flex flex-col justify-between h-full lg:h-auto"
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
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 lg:mt-5 flex flex-col gap-3">
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
                autoComplete="current-password"
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

          {error && (
            <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-xs font-medium text-danger">
              {error}
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
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>

      <div className="mt-4 lg:mt-6 shrink-0">
        <p className="text-center text-xs text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link
            href="/signup"
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Registrate
          </Link>
        </p>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
          v{APP_VERSION}
        </p>
      </div>
    </motion.div>
  )
}
