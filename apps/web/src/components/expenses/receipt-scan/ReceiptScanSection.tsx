'use client'

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
  return (
    <section className="grid items-stretch gap-6 xl:grid-cols-2">
      <div className="flex min-h-0 flex-col gap-4">
        <ReceiptScanUploader
          preview={preview}
          scanning={scanning}
          onFileSelect={onFileSelect}
          onScan={onScan}
          onClear={onClear}
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
        onClear={onClear}
        onApply={onApply}
      />
    </section>
  )
}
