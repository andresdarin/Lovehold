'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { validateAvatarFile, buildAvatarPath } from './utils'
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

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true)
    setError(null)

    const validationError = validateAvatarFile(file)
    if (validationError) {
      setError(validationError)
      setUploading(false)
      return null
    }

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id || !session?.access_token) throw new Error('No session')

      const path = buildAvatarPath(session.user.id, file)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      await apiFetch('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: publicUrl }),
      }, session.access_token)

      setUploading(false)
      return publicUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir la imagen'
      setError(message)
      setUploading(false)
      return null
    }
  }, [])

  const remove = useCallback(async (): Promise<boolean> => {
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id || !session?.access_token) throw new Error('No session')

      const prefix = `${session.user.id}`
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(session.user.id)

      if (!listError && files && files.length > 0) {
        const paths = files.map((f) => `${prefix}/${f.name}`)
        await supabase.storage.from('avatars').remove(paths)
      }

      await apiFetch('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: null }),
      }, session.access_token)

      setUploading(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al quitar la foto'
      setError(message)
      setUploading(false)
      return false
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { uploading, error, upload, remove, clearError }
}
