'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'
import type { ScanReceiptResponse } from './types'

export function useReceiptScan() {
  const supabase = createClient()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanReceiptResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectFile = useCallback((f: File | null) => {
    setError(null)
    setResult(null)
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }, [])

  const clear = useCallback(() => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }, [])

  const submitScan = useCallback(async () => {
    if (!file) {
      setError('Seleccioná o sacá una foto del ticket primero.')
      return
    }

    setScanning(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')

      const formData = new FormData()
      formData.append('image', file)

      const result = await apiFetch<ScanReceiptResponse>('/api/expenses/scan-receipt', {
        method: 'POST',
        body: formData,
        headers: {},
      }, session.access_token)

      setResult(result)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Error al analizar el ticket.')
      }
    } finally {
      setScanning(false)
    }
  }, [file, supabase])

  return {
    file, preview, scanning, result, error,
    selectFile, clear, submitScan,
  }
}
