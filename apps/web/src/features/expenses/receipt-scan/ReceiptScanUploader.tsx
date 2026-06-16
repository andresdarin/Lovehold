'use client'

import { useState, useEffect } from 'react'
import { Camera, ImageUp, ScanLine, X, Loader2 } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'

export default function ReceiptScanUploader({
  preview, scanning, onFileSelect, onScan, onClear,
}: {
  preview: string | null
  scanning: boolean
  onFileSelect: (file: File | null) => void
  onScan: () => void
  onClear: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (preview || scanning) return
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            onFileSelect(file)
            break
          }
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [preview, scanning, onFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!preview && !scanning) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (preview || scanning) return
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file)
    }
  }

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200"
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-background/85 backdrop-blur-md transition-all duration-200">
          <ScanLine className="h-10 w-10 animate-pulse text-primary mb-2" />
          <p className="text-sm font-bold text-foreground">Soltá la imagen del ticket acá</p>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10" aria-hidden="true">
          <ScanLine className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Escanear ticket</h2>
          <p className="text-sm text-muted-foreground">Sacá una foto o subí una imagen del ticket.</p>
        </div>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4">
        {preview ? (
          <div className="relative min-h-80 flex-1 overflow-hidden rounded-xl bg-black/10">
            <img
              src={preview}
              alt="Vista previa del ticket"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              disabled={scanning}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <label className="flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-soft px-4 py-6 text-center transition hover:border-primary/40 hover:bg-surface-soft/80">
              <ImageUp className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Subir imagen</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onFileSelect(f)
                }}
              />
            </label>
            <label className="flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-soft px-4 py-6 text-center transition hover:border-primary/40 hover:bg-surface-soft/80">
              <Camera className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Sacar foto</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onFileSelect(f)
                }}
              />
            </label>
          </div>
        )}

        {preview && !scanning && (
          <LiquidGlass variant="button" intensity="medium" className="mt-auto block w-full">
            <button
              type="button"
              onClick={onScan}
              className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-foreground focus-visible:outline-none"
            >
              <ScanLine className="h-4 w-4 text-primary" />
              Analizar ticket
            </button>
          </LiquidGlass>
        )}

        {scanning && (
          <div className="mt-auto flex items-center justify-center gap-3 rounded-xl bg-surface-soft py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Analizando ticket con IA…</span>
          </div>
        )}
      </div>
    </section>
  )
}
