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
      className="relative flex h-full flex-col rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-white/[0.025] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition-all duration-200 mb-4"
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-primary bg-background/85 backdrop-blur-md transition-all duration-200">
          <ScanLine className="h-10 w-10 animate-pulse text-primary mb-2" />
          <p className="text-xs font-bold text-foreground">Soltá la imagen del ticket acá</p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10" aria-hidden="true">
          <ScanLine className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Escanear ticket</h2>
          <p className="text-xs text-muted-foreground">Sacá una foto o subí una imagen del ticket.</p>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        {preview ? (
          <div className="relative min-h-64 flex-1 overflow-hidden rounded-xl bg-black/10">
            <img
              src={preview}
              alt="Vista previa del ticket"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              disabled={scanning}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <label className="flex h-24 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-2 py-4 text-center transition hover:border-primary/40 hover:bg-white/[0.04]">
              <ImageUp className="h-[22px] w-[22px] text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Subir imagen</span>
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
            <label className="flex h-24 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-2 py-4 text-center transition hover:border-primary/40 hover:bg-white/[0.04]">
              <Camera className="h-[22px] w-[22px] text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Sacar foto</span>
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
              className="flex w-full items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-foreground focus-visible:outline-none"
            >
              <ScanLine className="h-4 w-4 text-primary" />
              Analizar ticket
            </button>
          </LiquidGlass>
        )}

        {scanning && (
          <div className="mt-auto flex items-center justify-center gap-2.5 rounded-xl bg-white/[0.04] py-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Analizando ticket con IA…</span>
          </div>
        )}
      </div>
    </section>
  )
}
