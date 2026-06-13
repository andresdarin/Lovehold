'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'
import { parseAmount, toCents, sumItems, makeItem } from './constants'
import type { ExpenseForm, ExpenseItemForm } from './types'

const ROUNDING_TOLERANCE = 5

export function useExpenseForm(_profileName: string) {
  const supabase = createClient()

  const [form, setForm] = useState<ExpenseForm>({
    title: '',
    merchant: '',
    category: 'Compras de súper',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    notes: '',
  })
  const [items, setItems] = useState<ExpenseItemForm[]>([])
  const [amountTouched, setAmountTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const itemsTotal = sumItems(items)
  const declaredTotal = parseAmount(form.amount)
  const difference = items.length ? declaredTotal - itemsTotal : 0
  const hasBlockingDifference = items.length > 0 && Math.abs(toCents(difference)) > ROUNDING_TOLERANCE
  const isSupermarketExpense = form.category.toLowerCase().includes('súper') || form.category.toLowerCase().includes('super')
  const canSubmit = !!(form.title.trim() && form.category.trim() && declaredTotal > 0 && form.date && !hasBlockingDifference && !isSubmitting)

  const updateForm = useCallback((field: keyof ExpenseForm, value: string) => {
    if (field === 'amount') setAmountTouched(true)
    setForm((current) => ({ ...current, [field]: value }))
  }, [])

  const setItemsAndMaybeTotal = useCallback((nextItems: ExpenseItemForm[]) => {
    setItems(nextItems)
    if (!amountTouched && nextItems.length > 0) {
      setForm((current) => ({ ...current, amount: sumItems(nextItems).toFixed(2) }))
    }
  }, [amountTouched])

  const addItem = useCallback(() => {
    setItemsAndMaybeTotal([...items, makeItem()])
  }, [items, setItemsAndMaybeTotal])

  const removeItem = useCallback((localId: string) => {
    setItemsAndMaybeTotal(items.filter((item) => item.localId !== localId))
  }, [items, setItemsAndMaybeTotal])

  const updateItem = useCallback((localId: string, field: keyof ExpenseItemForm, value: string) => {
    const nextItems = items.map((item) => {
      if (item.localId !== localId) return item
      const nextItem = { ...item, [field]: value }
      const quantity = parseAmount(field === 'quantity' ? value : nextItem.quantity)
      const unitPrice = parseAmount(field === 'unitPrice' ? value : nextItem.unitPrice)
      if ((field === 'quantity' || field === 'unitPrice') && quantity > 0 && unitPrice > 0) {
        nextItem.total = (quantity * unitPrice).toFixed(2)
      }
      return nextItem
    })
    setItemsAndMaybeTotal(nextItems)
  }, [items, setItemsAndMaybeTotal])

  const useItemsTotalAsAmount = useCallback(() => {
    setAmountTouched(false)
    setForm((current) => ({ ...current, amount: itemsTotal.toFixed(2) }))
  }, [itemsTotal])

  const loadExample = useCallback((example: { form: ExpenseForm; items: ExpenseItemForm[] }) => {
    setAmountTouched(false)
    setItems(example.items)
    setForm(example.form)
    setError(null)
    setSuccess(null)
  }, [])

  const populateFromScan = useCallback((scanData: { merchant?: string; receiptDate?: string; total?: number; paymentMethod?: string; notes?: string; items?: ExpenseItemForm[] }) => {
    const generatedTitle = scanData.merchant ? `Compra en ${scanData.merchant}` : 'Gasto escaneado'
    setAmountTouched(false)
    if (scanData.items) setItems(scanData.items)
    setForm((current) => ({
      ...current,
      title: current.title || generatedTitle,
      merchant: scanData.merchant ?? current.merchant,
      amount: scanData.total?.toFixed(2) ?? current.amount,
      date: scanData.receiptDate ?? current.date,
      paymentMethod: scanData.paymentMethod ?? current.paymentMethod,
      notes: scanData.notes ? [current.notes, scanData.notes].filter(Boolean).join('\n') : current.notes,
    }))
    setError(null)
    setSuccess(null)
  }, [])

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

      if (!session) {
        throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
      }

      await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          merchant: form.merchant.trim() || undefined,
          category: form.category.trim(),
          amount: declaredTotal,
          date: form.date,
          paymentMethod: form.paymentMethod.trim() || undefined,
          splitType: 'EQUAL',
          notes: form.notes.trim() || undefined,
          items: items.length
            ? items.map((item) => ({
                name: item.name.trim(),
                itemCategory: item.itemCategory,
                quantity: item.quantity ? parseAmount(item.quantity) : undefined,
                unit: item.unit.trim() || undefined,
                unitPrice: item.unitPrice ? parseAmount(item.unitPrice) : undefined,
                total: parseAmount(item.total),
              }))
            : undefined,
        }),
      }, session.access_token)

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

  return {
    form,
    items,
    itemsTotal,
    declaredTotal,
    difference,
    hasBlockingDifference,
    isSupermarketExpense,
    canSubmit,
    isSubmitting,
    error,
    success,
    updateForm,
    addItem,
    removeItem,
    updateItem,
    useItemsTotalAsAmount,
    loadExample,
    populateFromScan,
    handleSubmit,
  }
}
