'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { currentMonthKey } from './constants'
import type { PersonalExpense } from './types'

export function usePersonalFinance(monthKey?: string) {
  const key = monthKey ?? currentMonthKey()
  const [expenses, setExpenses] = useState<PersonalExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      const data = await apiFetch<PersonalExpense[]>(`/api/personal-finance?monthKey=${key}`, {}, session.access_token)
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { expenses, loading, error, refetch: fetchExpenses }
}

export function useCreateExpense() {
  const [submitting, setSubmitting] = useState(false)

  const create = useCallback(async (data: unknown) => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      return await apiFetch<PersonalExpense>('/api/personal-finance', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session.access_token)
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { create, submitting }
}
