'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailConfirmMessage, setEmailConfirmMessage] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailConfirmMessage(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-muted bg-surface p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Crear cuenta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm text-foreground/70">
              Nombre visible
            </label>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-muted bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-foreground/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-muted bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-foreground/70">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-muted bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{error}</p>
          )}

          {emailConfirmMessage && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
              {emailConfirmMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
