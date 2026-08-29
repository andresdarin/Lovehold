import { useState, useEffect, useRef } from 'react'
import { Camera, Upload, ScanLine, X, Loader2 } from 'lucide-react'

export default function ReceiptScanUploader({
  preview, scanning, onFileSelect, onScan, onClear, autoCamera, inBanner = false,
}: {
  preview: string | null
  scanning: boolean
  onFileSelect: (file: File | null) => void
  onScan: () => void
  onClear: () => void
  autoCamera?: boolean
  inBanner?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoCamera && !preview && cameraInputRef.current) {
      try {
        cameraInputRef.current.click()
      } catch {
        // En navegadores estrictos requiere un user gesture; los botones directos lo gatillan
      }
    }
  }, [autoCamera, preview])

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
      className={`relative flex flex-col rounded-3xl p-4 sm:p-5 shadow-xs transition-all select-none ${
        inBanner
          ? 'border border-white/20 bg-white/10 backdrop-blur-md text-white'
          : 'border border-border/80 bg-surface text-foreground'
      }`}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary bg-background/90 backdrop-blur-md transition-all duration-200">
          <ScanLine className="h-10 w-10 animate-pulse text-primary mb-2" />
          <p className="text-xs font-bold text-foreground">Soltá la imagen del ticket acá</p>
        </div>
      )}
      
      {/* Header del bloque de captura */}
      <div className={`pb-3 flex items-center justify-between ${inBanner ? 'border-b border-white/15' : 'border-b border-border/60'}`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
            inBanner
              ? 'border-white/30 bg-white/15 text-[#C0D5D6]'
              : 'border-primary/20 bg-primary/10 text-primary'
          }`}>
            <ScanLine className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className={`text-xs sm:text-sm font-bold ${inBanner ? 'text-[#F5F2EE]' : 'text-foreground'}`}>
              Capturar comprobante
            </h2>
            <p className={`text-[11px] ${inBanner ? 'text-[#C0D5D6]' : 'text-muted-foreground'}`}>
              Sacá una foto o subí una imagen para analizar con IA.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex min-h-0 flex-1 flex-col gap-3">
        {preview ? (
          <div className={`relative min-h-56 max-h-80 flex-1 overflow-hidden rounded-2xl border ${
            inBanner ? 'border-white/20 bg-black/20' : 'bg-surface-soft border-border/80'
          }`}>
            <img
              src={preview}
              alt="Vista previa del ticket"
              className="h-full w-full object-contain bg-black/10"
            />
            <button
              type="button"
              onClick={onClear}
              disabled={scanning}
              className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border transition focus:outline-none shadow-xs active:scale-95 disabled:opacity-50 ${
                inBanner
                  ? 'border-white/30 bg-black/60 text-white hover:bg-black/80'
                  : 'bg-surface/90 backdrop-blur-sm border-border/80 text-foreground hover:bg-surface'
              }`}
              aria-label="Quitar imagen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Acción 1: Sacar Foto */}
            <label className={`flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all active:scale-[0.98] shadow-xs ${
              inBanner
                ? 'border border-white/20 bg-white/10 hover:bg-white/20 text-white'
                : 'border border-[#407E8C]/25 bg-[#C0D5D6]/20 dark:bg-[#083A4F]/40 hover:bg-[#C0D5D6]/35 text-primary'
            }`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-2xs ${
                inBanner
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-[#407E8C]/30 bg-surface text-primary'
              }`}>
                <Camera className="h-4 w-4 stroke-[2.2]" />
              </div>
              <span className={`text-xs font-bold ${inBanner ? 'text-white' : 'text-primary dark:text-primary-foreground'}`}>
                Sacar foto
              </span>
              <input
                ref={cameraInputRef}
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

            {/* Acción 2: Subir Imagen */}
            <label className={`flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all active:scale-[0.98] shadow-xs ${
              inBanner
                ? 'border border-[#A58D66]/40 bg-[#A58D66]/20 hover:bg-[#A58D66]/30 text-white'
                : 'border border-[#A58D66]/30 bg-[#A58D66]/10 dark:bg-[#A58D66]/20 hover:bg-[#A58D66]/20 text-primary'
            }`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-2xs ${
                inBanner
                  ? 'border-[#A58D66]/50 bg-[#A58D66]/30 text-[#F5F2EE]'
                  : 'border-[#A58D66]/30 bg-surface text-[#A58D66]'
              }`}>
                <Upload className="h-4 w-4 stroke-[2.2]" />
              </div>
              <span className={`text-xs font-bold ${inBanner ? 'text-[#F5F2EE]' : 'text-primary dark:text-primary-foreground'}`}>
                Subir imagen
              </span>
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
          </div>
        )}

        {preview && !scanning && (
          <button
            type="button"
            onClick={onScan}
            className={`flex w-full items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-2xl shadow-sm transition-all focus:outline-none active:scale-95 ${
              inBanner
                ? 'bg-[#C0D5D6] hover:bg-[#a8c6c8] text-[#083A4F]'
                : 'bg-primary text-primary-foreground hover:bg-primary-hover'
            }`}
          >
            <ScanLine className="h-4 w-4" />
            Analizar comprobante con IA
          </button>
        )}

        {scanning && (
          <div className={`flex items-center justify-center gap-2.5 py-3 rounded-2xl border ${
            inBanner
              ? 'border-white/20 bg-white/10 text-[#F5F2EE]'
              : 'bg-surface-soft border-border/80 text-foreground'
          }`}>
            <Loader2 className="h-4 w-4 animate-spin text-[#C0D5D6]" />
            <span className="text-xs font-semibold">Extrayendo datos del ticket…</span>
          </div>
        )}
      </div>
    </section>
  )
}
