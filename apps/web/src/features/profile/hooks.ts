'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import type { EditProfileData, EditProfileState } from './types'

export function useEditProfile() {
  const [state, setState] = useState<EditProfileState>({ saving: false, error: null, success: false })

  const update = useCallback(async (data: EditProfileData) => {
    setState({ saving: true, error: null, success: false })
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No session')

      await apiFetch('/api/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, session.access_token)

      setState({ saving: false, error: null, success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar'
      setState({ saving: false, error: message, success: false })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ saving: false, error: null, success: false })
  }, [])

  return { ...state, update, reset }
}
