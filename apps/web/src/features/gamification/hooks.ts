'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { buildRankProfile } from './ranks.utils'
import type { GamificationProfile } from './ranks.types'

export function useGamification() {
  const [data, setData] = useState<GamificationProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No session')
      }
      const result = await apiFetch<{ totalXp: number }>('/api/gamification/profile', {}, session.access_token)
      setData(buildRankProfile(result.totalXp))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { data, loading, error, refetch: fetchProfile }
}
