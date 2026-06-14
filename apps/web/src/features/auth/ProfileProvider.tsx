'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'
import AppShell from '../shell/AppShell'

interface Profile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  color: string
  createdAt: string
}

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

/**
 * Proveedor de Perfil y Sesión para la zona autenticada.
 * Valida la autenticación, obtiene los datos del perfil y envuelve la UI en el AppShell.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(token: string) {
    const me = await apiFetch<Profile>('/api/me', {}, token)
    setProfile(me)
  }

  useEffect(() => {
    async function load() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/login')
        return
      }

      try {
        await fetchProfile(session.access_token)
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

  async function refreshProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      await fetchProfile(session.access_token)
    } catch {
      // Silently fail on refresh — data stays stale
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Heart className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Cargando tu espacio…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 bg-background">
        <Heart className="h-10 w-10 text-primary/40" />
        <p className="max-w-xs text-center text-sm text-danger">{error}</p>
        <button
          onClick={logout}
          className="rounded-2xl border border-border bg-surface px-6 py-3 text-sm text-foreground transition hover:bg-surface-soft"
        >
          Volver al inicio
        </button>
      </main>
    )
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, error, logout, refreshProfile }}>
      <AppShell profile={profile} onLogout={logout}>
        {children}
      </AppShell>
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile debe usarse dentro de un ProfileProvider')
  }
  return context
}
