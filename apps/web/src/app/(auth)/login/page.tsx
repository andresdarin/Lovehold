'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'
import { AuthBrand, AuthField, AuthSubmitButton } from '@/features/auth/AuthComponents'

/**
 * Vista de Login rediseñada para Finnic.
 * Formulario monolítico en cristal cálido con header centrado y botón CTA circular sólido
 * integrado a la derecha en el medio de los dos inputs.
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
      if (err instanceof ApiError && err.status === 401) {
        await supabase.auth.signOut()
        setError(err.message || 'Sesión no válida. Tu token no fue aceptado por el servidor.')
      } else {
        setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
      }
      setLoading(false)
    }
  }

  const isFormValid = Boolean(email && password)

  return (
    <div className="flex flex-col gap-7 sm:gap-9">
      {/* Encabezado Editorial Finnic Centrado */}
      <AuthBrand
        title="Iniciar sesión"
        subtitle="Tu copiloto financiero"
      />

      {/* Formulario monolítico en bloque de cristal cálido (Sand/Navy) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative flex items-center justify-between overflow-hidden rounded-3xl border border-navy/10 dark:border-white/10 bg-[#F5F2EE]/85 dark:bg-surface/80 shadow-xl shadow-navy/5 dark:shadow-black/30 backdrop-blur-md transition-all">
          <div className="flex flex-1 flex-col divide-y divide-navy/10 dark:divide-white/10">
            <AuthField
              id="email"
              label="Correo electrónico"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              icon={<Mail className="h-5 w-5 text-accent dark:text-accent stroke-[2.2]" />}
            />

            <AuthField
              id="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              icon={<LockKeyhole className="h-5 w-5 text-navy dark:text-secondary stroke-[2.2]" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="rounded-full p-1 text-teal dark:text-secondary transition-colors hover:text-navy dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 stroke-[2]" /> : <Eye className="h-4 w-4 stroke-[2]" />}
                </button>
              }
            />
          </div>

          {/* CTA Circular Sólido Integrado a la derecha en el medio de los dos inputs */}
          <div className="p-3 sm:p-3.5 pr-4 flex items-center justify-center">
            <AuthSubmitButton
              loading={loading}
              disabled={!isFormValid}
              ariaLabel="Iniciar sesión en Finnic"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-xs font-medium text-danger animate-fade-in backdrop-blur-xs">
            {error}
          </p>
        )}
      </form>

      {/* Enlaces de pie y navegación */}
      <footer className="mt-2 flex flex-col items-center gap-3">
        <p className="text-center text-xs sm:text-sm font-medium text-navy/80 dark:text-foreground/80">
          ¿No tenés cuenta?{' '}
          <Link
            href="/signup"
            className="font-bold text-accent hover:text-accent-hover transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            Crear cuenta
          </Link>
        </p>
      </footer>
    </div>
  )
}
