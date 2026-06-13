'use client'

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
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ScanLine className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Escanear ticket</h2>
          <p className="text-sm text-muted-foreground">Sacá una foto o subí una imagen del ticket.</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Vista previa del ticket"
              className="max-h-64 w-full rounded-xl object-contain bg-black/5"
            />
            <button
              type="button"
              onClick={onClear}
              disabled={scanning}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 disabled:opacity-50"
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
          <LiquidGlass variant="button" intensity="medium" className="block w-full">
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
          <div className="flex items-center justify-center gap-3 rounded-xl bg-surface-soft py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Analizando ticket con IA…</span>
          </div>
        )}
      </div>
    </section>
  )
}
