'use client'

import LiquidGlass from '@/components/ui/LiquidGlass'
import { ProfileAvatarFeature } from './ProfileAvatarFeature'
import { ProfileIdentityHeadline } from './ProfileIdentityHeadline'
import { RankProgressCompact } from './RankProgressCompact'
import type { GamificationProfile } from '@/features/gamification/ranks.types'

interface ProfileEditorialHeroProps {
  displayName: string | null
  email: string | undefined
  avatarUrl: string | null | undefined
  color: string | undefined
  createdAt: string | undefined
  gamification: GamificationProfile | null
  gamificationLoading: boolean
  onEdit: () => void
  onAvatarUpdate: (avatarUrl: string | null) => void
}

/**
 * Full-width editorial hero card with a tight 3-zone horizontal layout:
 *   avatar | identity | rank/progress
 *
 * The rank block is intentionally sized to give it visual weight alongside
 * the user identity, communicating both "who you are" and "where you stand".
 */
export function ProfileEditorialHero({
  displayName,
  email,
  avatarUrl,
  color,
  createdAt,
  gamification,
  gamificationLoading,
  onEdit,
  onAvatarUpdate,
}: ProfileEditorialHeroProps) {
  return (
    <LiquidGlass
      variant="card"
      intensity="medium"
      className="relative overflow-hidden border border-white/5 shadow-2xl"
    >
      {/* Ambient background glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-[0.07] pointer-events-none"
        style={{ backgroundColor: color ?? 'var(--primary)' }}
      />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-[0.05] pointer-events-none bg-primary" />

      <div className="relative z-10 p-6 lg:p-8">
        {/* 3-zone horizontal layout */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* LEFT: Avatar — visual anchor */}
          <div className="flex justify-center lg:justify-start shrink-0">
            <ProfileAvatarFeature
              avatarUrl={avatarUrl}
              displayName={displayName}
              email={email}
              color={color}
              onAvatarUpdate={onAvatarUpdate}
            />
          </div>

          {/* CENTER: Identity */}
          <div className="flex-1 min-w-0">
            <ProfileIdentityHeadline
              displayName={displayName}
              email={email}
              createdAt={createdAt}
              onEdit={onEdit}
            />
          </div>

          {/* RIGHT: Rank + Progress */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl bg-surface-soft/20 border border-border/30 p-5">
              <RankProgressCompact
                data={gamification}
                loading={gamificationLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </LiquidGlass>
  )
}
