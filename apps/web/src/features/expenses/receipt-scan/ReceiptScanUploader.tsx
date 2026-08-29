import { useState, useEffect } from 'react'
import { Camera, Upload, ScanLine, X, Loader2 } from 'lucide-react'

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
      className="relative flex flex-col rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all select-none"
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary bg-background/90 backdrop-blur-md transition-all duration-200">
          <ScanLine className="h-10 w-10 animate-pulse text-primary mb-2" />
          <p className="text-xs font-bold text-foreground">Soltá la imagen del ticket acá</p>
        </div>
      )}
      
      {/* Header */}
      <div className="pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <ScanLine className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-sm font-bold text-foreground">Escanear ticket</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Sacá una foto o subí una imagen del ticket.</p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        {preview ? (
          <div className="relative min-h-64 flex-1 overflow-hidden rounded-2xl bg-surface-soft border border-border">
            <img
              src={preview}
              alt="Vista previa del ticket"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              disabled={scanning}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm border border-border text-foreground transition hover:bg-surface disabled:opacity-50 focus:outline-none shadow-sm"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface-soft/60 text-center hover:border-primary hover:bg-surface-soft transition-all">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-foreground font-semibold">Subir imagen</span>
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
            <label className="flex h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface-soft/60 text-center hover:border-primary hover:bg-surface-soft transition-all">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-foreground font-semibold">Sacar foto</span>
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
          <button
            type="button"
            onClick={onScan}
            className="flex w-full items-center justify-center gap-2 py-3 text-xs font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-all focus:outline-none active:scale-95"
          >
            <ScanLine className="h-4 w-4" />
            Analizar ticket con IA
          </button>
        )}

        {scanning && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface-soft border border-border">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs font-semibold text-foreground">Analizando ticket con IA…</span>
          </div>
        )}
      </div>
    </section>
  )
}
