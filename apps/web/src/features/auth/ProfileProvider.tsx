'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RotateCcw, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'
import AppShell from '../shell/AppShell'
import FeatherLoading from '@/components/ui/FeatherLoading'
import BannerFeatherPattern from '@/components/ui/BannerFeatherPattern'
import FinnicOwlIcon from '@/components/ui/FinnicOwlIcon'

interface Profile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  color: string
  createdAt: string
  role?: string | null
  isAdmin?: boolean
}

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  role: string | null
  isAdmin: boolean
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
  const [role, setRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  async function fetchProfile(token: string) {
    const me = await apiFetch<Profile>('/api/me', {}, token)
    setProfile(me)
    if (me.role) setRole(me.role)
    if (me.isAdmin === true || me.role?.toUpperCase() === 'ADMIN') setIsAdmin(true)
  }

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      router.push('/login')
      return
    }

    const claims = session.user.app_metadata ?? {}
    const jwtRole = typeof claims.role === 'string' ? claims.role : null
    setRole(jwtRole)
    setIsAdmin(claims.isAdmin === true || claims.admin === true || jwtRole?.toUpperCase() === 'ADMIN')

    try {
      await fetchProfile(session.access_token)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }
      if (err instanceof ApiError && err.status === 404) {
        setError('Perfil no encontrado. Por favor, volvé a iniciar sesión.')
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil')
      }
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    load()
  }, [load])

  const handleRetry = () => {
    load()
  }

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
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <FeatherLoading
          variant="fullscreen"
          message="Cargando tu espacio…"
          subtitle="Conectando con Finnic"
        />
      </main>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#F5F2EE] px-4 py-8 text-foreground transition-colors duration-500 select-none sm:px-6 dark:bg-[#071D27]">
        <BannerFeatherPattern />

        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#407E8C]/15 blur-3xl dark:bg-[#407E8C]/20" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-[#A58D66]/15 blur-3xl dark:bg-[#A58D66]/10" />

        <main className="relative z-10 mx-auto flex w-full max-w-[440px] flex-col items-center rounded-3xl border border-border/80 bg-surface/90 p-7 sm:p-9 shadow-xl shadow-black/5 backdrop-blur-md text-center">
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-danger/10 blur-xl dark:bg-danger/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-soft border border-border/80 shadow-xs">
              <div className="dark:hidden">
                <FinnicOwlIcon color="navy" className="h-12 w-12" />
              </div>
              <div className="hidden dark:block">
                <FinnicOwlIcon color="aqua" className="h-12 w-12" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">
            No pudimos conectar con tu espacio
          </span>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl dark:text-foreground">
            Error de conexión
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {error === 'Failed to fetch'
              ? 'No pudimos comunicarnos con el servidor de Finnic. Comprobá tu conexión a internet o reintentá en unos segundos.'
              : error}
          </p>

          <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#083A4F] px-5 py-3.5 text-sm font-semibold text-[#F5F2EE] shadow-md shadow-[#083A4F]/15 transition-all hover:bg-[#0B465D] hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-[#407E8C] dark:hover:bg-[#356975]"
            >
              <RotateCcw className="h-4 w-4 stroke-[2.2] transition-transform group-hover:-rotate-45" />
              <span>Reintentar</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-soft hover:border-primary/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <LogOut className="h-4 w-4 stroke-[2] text-muted-foreground" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </main>

        <footer className="relative z-10 mt-6 text-xs text-muted-foreground/80">
          Finnic · Tu copiloto financiero personal y en pareja
        </footer>
      </div>
    )
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, error, logout, refreshProfile, role, isAdmin }}>
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
