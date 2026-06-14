'use client'

import { useRef } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { useAvatarUpload } from './hooks'

interface AvatarUploadButtonProps {
  hasAvatar: boolean
  onUploadComplete: (avatarUrl: string | null) => void
}

export function AvatarUploadButton({ hasAvatar, onUploadComplete }: AvatarUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploading, error, upload, remove, clearError } = useAvatarUpload()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    clearError()
    const url = await upload(file)
    if (url) onUploadComplete(url)
    e.target.value = ''
  }

  async function handleRemove() {
    clearError()
    const ok = await remove()
    if (ok) onUploadComplete(null)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-1.5">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft disabled:opacity-50"
          title="Cambiar foto"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        {hasAvatar && (
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-danger/70 transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"
            title="Quitar foto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="max-w-[180px] text-center text-xs text-danger">{error}</p>
      )}
    </div>
  )
}
