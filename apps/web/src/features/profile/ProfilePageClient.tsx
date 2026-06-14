'use client'

import { useState } from 'react'
import { useProfile } from '@/features/auth/ProfileProvider'
import { useGamification } from '@/features/gamification/hooks'
import { ProfileHeroCard } from './ProfileHeroCard'
import { EditProfileModal } from './EditProfileModal'
import { ProfileRankCard } from './ProfileRankCard'
import { AchievementsPreviewCard } from './AchievementsPreviewCard'
import { PreferencesCard } from './PreferencesCard'
import { AccountCard } from './AccountCard'

export default function ProfilePageClient() {
  const { profile, logout, refreshProfile } = useProfile()
  const { data: gamification, loading: gamificationLoading, error: gamificationError } = useGamification()
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-muted-foreground">Tus datos personales y progreso</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileHeroCard
          displayName={profile?.displayName ?? null}
          email={profile?.email}
          avatarUrl={profile?.avatarUrl}
          color={profile?.color}
          createdAt={profile?.createdAt}
          onEdit={() => setEditOpen(true)}
        />
        <ProfileRankCard
          data={gamification}
          loading={gamificationLoading}
          error={gamificationError}
        />
      </div>

      <AchievementsPreviewCard />

      <div className="grid gap-6 lg:grid-cols-2">
        <PreferencesCard />
        <AccountCard email={profile?.email} onLogout={logout} />
      </div>

      <EditProfileModal
        open={editOpen}
        currentName={profile?.displayName ?? null}
        onClose={() => setEditOpen(false)}
        onSaved={refreshProfile}
      />
    </div>
  )
}
