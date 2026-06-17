'use client'

import { ProfileAvatar } from './ProfileAvatar'
import { AvatarUploadButton } from './AvatarUploadButton'

interface ProfileAvatarFeatureProps {
  avatarUrl: string | null | undefined
  displayName: string | null | undefined
  email: string | undefined
  color: string | undefined
  onAvatarUpdate: (avatarUrl: string | null) => void
}

/**
 * Large focal-point avatar (200px) with a coral-tinted ring
 * and a floating upload/remove button overlay.
 */
export function ProfileAvatarFeature({
  avatarUrl,
  displayName,
  email,
  color,
  onAvatarUpdate,
}: ProfileAvatarFeatureProps) {
  return (
    <div className="relative inline-flex group">
      {/* Ambient glow behind the avatar */}
      <div
        className="absolute inset-0 rounded-full blur-[40px] opacity-25 transition-opacity duration-500 group-hover:opacity-35"
        style={{ backgroundColor: color ?? 'var(--primary)' }}
      />

      {/* Coral ring */}
      <div className="relative rounded-full p-[3px] bg-gradient-to-br from-primary/50 via-primary/25 to-transparent shadow-2xl shadow-primary/15">
        <div className="rounded-full border-2 border-background">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            color={color}
            size={260}
          />
        </div>
      </div>

      {/* Upload button overlay */}
      <div className="absolute bottom-2 right-2 z-10 opacity-80 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200">
        <AvatarUploadButton
          hasAvatar={!!avatarUrl}
          onUploadComplete={onAvatarUpdate}
        />
      </div>
    </div>
  )
}
