'use client'

import { useEffect, useState } from 'react'
import ReceiptImageModal from './ReceiptImageModal'
import ReceiptScanCollapsed from './ReceiptScanCollapsed'
import ReceiptScanReviewPanel from './ReceiptScanReviewPanel'
import ReceiptScanUploader from './ReceiptScanUploader'
import type { ScanReceiptResponse } from './types'

export default function ReceiptScanSection({
  preview, scanning, error, result, onFileSelect, onScan, onClear, onApply,
}: {
  preview: string | null
  scanning: boolean
  error: string | null
  result: ScanReceiptResponse | null
  onFileSelect: (file: File | null) => void
  onScan: () => void
  onClear: () => void
  onApply: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)

  useEffect(() => {
    if (!result) setCollapsed(false)
  }, [result])

  function handleApply() {
    onApply()
    setCollapsed(true)
  }

  function handleClear() {
    setImageOpen(false)
    setCollapsed(false)
    onClear()
  }

  if (result && collapsed) {
    return (
      <>
        <ReceiptScanCollapsed
          result={result}
          onViewImage={() => setImageOpen(true)}
          onReanalyze={() => setCollapsed(false)}
          onClear={handleClear}
        />
        <ReceiptImageModal open={imageOpen} src={preview} onClose={() => setImageOpen(false)} />
      </>
    )
  }

  return (
    <section className="grid items-stretch gap-6 xl:grid-cols-2">
      <div className="flex min-h-0 flex-col gap-4">
        <ReceiptScanUploader
          preview={preview}
          scanning={scanning}
          onFileSelect={onFileSelect}
          onScan={onScan}
          onClear={handleClear}
        />
        {error && (
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}
      </div>
      <ReceiptScanReviewPanel
        result={result}
        scanning={scanning}
        onClear={handleClear}
        onApply={handleApply}
      />
    </section>
  )
}
