'use client'

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import { makeItem, parseAmount, sumItems } from '../constants'
import type { ExpenseForm, ExpenseItemForm } from '../types'

export function useExpenseItems({
  amountTouched, setForm,
}: {
  amountTouched: boolean
  setForm: Dispatch<SetStateAction<ExpenseForm>>
}) {
  const [items, setItems] = useState<ExpenseItemForm[]>([])

  const setItemsAndMaybeTotal = useCallback((nextItems: ExpenseItemForm[]) => {
    setItems(nextItems)
    if (!amountTouched && nextItems.length > 0) {
      setForm((current) => ({ ...current, amount: sumItems(nextItems).toFixed(2) }))
    }
  }, [amountTouched, setForm])

  const addItem = useCallback(() => {
    setItemsAndMaybeTotal([...items, makeItem()])
  }, [items, setItemsAndMaybeTotal])

  const removeItem = useCallback((localId: string) => {
    setItemsAndMaybeTotal(items.filter((item) => item.localId !== localId))
  }, [items, setItemsAndMaybeTotal])

  const clearItems = useCallback(() => {
    setItemsAndMaybeTotal([])
  }, [setItemsAndMaybeTotal])

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

  return { items, setItems, addItem, removeItem, clearItems, updateItem }
}
