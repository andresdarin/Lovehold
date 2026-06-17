'use client'

import { Edit3, Calendar } from 'lucide-react'
import { formatMemberSince } from './utils'

interface ProfileIdentityHeadlineProps {
  displayName: string | null
  email: string | undefined
  createdAt: string | undefined
  onEdit: () => void
}

/**
 * Identity headline: user name as the primary heading, secondary metadata,
 * a subtle status pill, and the main CTA.
 */
export function ProfileIdentityHeadline({
  displayName,
  email,
  createdAt,
  onEdit,
}: ProfileIdentityHeadlineProps) {
  const isComplete = !!displayName

  return (
    <div className="flex flex-col gap-3">
      {/* Name — clear and intentional */}
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight sm:text-4xl">
        {displayName ?? (
          <span className="text-muted-foreground/50 italic font-bold">Sin nombre visible</span>
        )}
      </h1>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="text-sm text-muted-foreground/80">{email}</span>

        {createdAt && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            Miembro desde {formatMemberSince(createdAt)}
          </span>
        )}

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
            isComplete
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-warning/10 border-warning/30 text-warning'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-success' : 'bg-warning'}`} />
          {isComplete ? 'Perfil completo' : 'Perfil incompleto'}
        </span>
      </div>

      {/* Primary CTA — one clear action */}
      <button
        onClick={onEdit}
        className="mt-1 self-start flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={isComplete ? 'Editar perfil' : 'Completar perfil'}
      >
        <Edit3 className="h-4 w-4" />
        {isComplete ? 'Editar perfil' : 'Completar perfil'}
      </button>
    </div>
  )
}
