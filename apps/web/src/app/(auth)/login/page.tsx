'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'

/**
 * Vista de Login.
 * Renderiza el formulario unificado (responsivo) con transiciones coordinadas con la ilustración.
 */
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        Iniciar sesión
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/40 outline-none transition-all focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/40 focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/40"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FF6B6B]">
            {error}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 py-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#2D255F]/[0.06]" />
          <Heart className="h-6 w-6 text-[#FF6B6B]/25" />
          <span className="h-px flex-1 bg-[#2D255F]/[0.06]" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF3D8B] py-[14px] font-semibold text-white shadow-lg shadow-[#FF6B6B]/25 transition-all hover:shadow-xl hover:shadow-[#FF6B6B]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#2D255F]/50">
        ¿No tenés cuenta?{' '}
        <Link
          href="/signup"
          className="rounded font-medium text-[#FF6B6B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]/50 focus-visible:ring-offset-2"
        >
          Registrate
        </Link>
      </p>
    </motion.div>
  )
}
