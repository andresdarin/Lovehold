import { Edit3, Camera } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { ProfileAvatar } from './ProfileAvatar'
import { formatMemberSince } from './utils'

interface ProfileHeroCardProps {
  displayName: string | null
  email: string | undefined
  avatarUrl: string | null | undefined
  color: string | undefined
  createdAt: string | undefined
  onEdit: () => void
}

export function ProfileHeroCard({
  displayName,
  email,
  avatarUrl,
  color,
  createdAt,
  onEdit,
}: ProfileHeroCardProps) {
  return (
    <LiquidGlass variant="card" intensity="medium" className="p-6">
      <div className="flex flex-col items-center gap-5 sm:items-start">
        <div className="relative">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            color={color}
            size={96}
          />
          <button
            disabled
            title="Cambiar foto (próximamente)"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground opacity-60 cursor-not-allowed"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-foreground">
            {displayName ?? (
              <span className="text-muted-foreground italic">Sin nombre</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          {createdAt && (
            <p className="mt-1 text-xs text-muted-foreground/60">
              Miembro desde {formatMemberSince(createdAt)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <Edit3 className="h-4 w-4" />
            {displayName ? 'Editar perfil' : 'Completar perfil'}
          </button>
        </div>
      </div>
    </LiquidGlass>
  )
}
