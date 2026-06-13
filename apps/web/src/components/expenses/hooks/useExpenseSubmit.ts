'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ApiError } from '@/lib/api'
import { submitExpense } from '../expense-form/submitExpense'
import type { ExpenseForm, ExpenseItemForm } from '../types'

export function useExpenseSubmit({
  form, items, declaredTotal, hasBlockingDifference,
}: {
  form: ExpenseForm
  items: ExpenseItemForm[]
  declaredTotal: number
  hasBlockingDifference: boolean
}) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    setError(null)
    setSuccess(null)
    if (hasBlockingDifference) {
      setError('La diferencia entre el total declarado y los ítems supera $0.05.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
      await submitExpense({ token: session.access_token, form, items, declaredTotal })
      setSuccess('Gasto cargado. Cuando activemos el listado, va a aparecer en movimientos.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(Array.isArray(err.message) ? err.message.join(', ') : err.message)
      } else {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el gasto.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [form, items, declaredTotal, hasBlockingDifference, supabase])

  return { isSubmitting, error, success, setError, setSuccess, handleSubmit }
}
