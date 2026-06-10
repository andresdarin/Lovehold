'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'

interface Profile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  color: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/login')
        return
      }

      try {
        const me = await apiFetch<Profile>('/api/me', {}, session.access_token)
        setProfile(me)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setError('Perfil no encontrado. Por favor, volvé a iniciar sesión.')
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar el perfil')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/60">Cargando…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-primary">{error}</p>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-surface px-4 py-2 text-foreground/70 hover:text-foreground"
        >
          Volver al inicio
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-bold">Lovehold dashboard</h1>

      {profile && (
        <section className="rounded-xl border border-muted bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Tu perfil</h2>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/60">Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/60">Nombre</dt>
              <dd>{profile.displayName ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/60">Color</dt>
              <dd className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: profile.color }}
                />
                {profile.color}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/60">Miembro desde</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString('es-AR')}</dd>
            </div>
          </dl>
        </section>
      )}

      <button
        onClick={handleLogout}
        className="self-start rounded-lg border border-muted bg-surface px-4 py-2 text-sm text-foreground/70 hover:text-foreground"
      >
        Cerrar sesión
      </button>
    </main>
  )
}
