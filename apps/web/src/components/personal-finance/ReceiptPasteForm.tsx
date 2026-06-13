'use client'

import React, { useState } from 'react'
import { parseReceiptText } from './parseReceiptText'
import ExpenseForm from './ExpenseForm'
import type { DetectedReceiptItem } from './types'

interface ReceiptPasteFormProps {
  onSubmit: (data: Parameters<typeof ExpenseForm.prototype.props.onSubmit>[0]) => void
  onCancel: () => void
  submitting: boolean
}

export default function ReceiptPasteForm({ onSubmit, onCancel, submitting }: ReceiptPasteFormProps) {
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState<{ items: DetectedReceiptItem[]; total: number | null } | null>(null)
  const [_ignoredCount, setIgnoredCount] = useState(0)

  function handleProcess() {
    const result = parseReceiptText(rawText)
    const items = result.items.map((item, i) => ({
      ...item,
      id: `parsed_${i}_${Date.now()}`,
    }))
    setParsed({ items, total: result.detectedTotal })
    setIgnoredCount(result.ignored.length)
  }

  if (parsed) {
    return (
      <ExpenseForm
        onSubmit={onSubmit}
        onCancel={() => { setParsed(null); onCancel() }}
        submitting={submitting}
        initialItems={parsed.items}
        initialTotal={parsed.total ?? undefined}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Pegá el texto del ticket acá
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={12}
          className="w-full rounded-2xl border border-border bg-surface p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 font-mono"
          placeholder="Pegá el contenido del ticket de supermercado..."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          El parser intentará detectar productos con precios. Revisá y corregí los ítems antes de guardar.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={handleProcess} disabled={!rawText.trim()}
          className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/45">
          Procesar ticket
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/45">
          Cancelar
        </button>
      </div>
    </div>
  )
}
