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
      className="relative flex flex-col rounded-xl border-[0.5px] border-white/[0.08] bg-[#121214]/60 backdrop-blur-[20px] p-4 transition-all duration-200 select-none"
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary bg-background/85 backdrop-blur-md transition-all duration-200">
          <ScanLine className="h-10 w-10 animate-pulse text-primary mb-2" />
          <p className="text-xs font-medium text-foreground">Soltá la imagen del ticket acá</p>
        </div>
      )}
      
      {/* Header plano */}
      <div className="pb-3 border-b-[0.5px] border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ScanLine className="h-[18px] w-[18px] text-foreground" />
          <h2 className="text-[15px] font-medium text-foreground">Escanear ticket</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Sacá una foto o subí una imagen del ticket.</p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        {preview ? (
          <div className="relative min-h-64 flex-1 overflow-hidden rounded-lg bg-black/10">
            <img
              src={preview}
              alt="Vista previa del ticket"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              disabled={scanning}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75 disabled:opacity-50 focus:outline-none"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1px] border-dashed border-white/10 bg-transparent text-center hover:border-primary/45 hover:bg-white/[0.02] transition-all">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground font-normal">Subir imagen</span>
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
            <label className="flex h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1px] border-dashed border-white/10 bg-transparent text-center hover:border-primary/45 hover:bg-white/[0.02] transition-all">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground font-normal">Sacar foto</span>
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
            className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg border border-white/10 bg-white/[0.02] text-foreground hover:bg-white/[0.06] transition-colors focus:outline-none"
          >
            <ScanLine className="h-4 w-4 text-foreground/70" />
            Analizar ticket
          </button>
        )}

        {scanning && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/[0.03]">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Analizando ticket con IA…</span>
          </div>
        )}
      </div>
    </section>
  )
}
