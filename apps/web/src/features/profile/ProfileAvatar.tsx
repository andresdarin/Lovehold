import { getInitial } from './utils'

interface ProfileAvatarProps {
  avatarUrl: string | null | undefined
  displayName: string | null | undefined
  email: string | undefined
  color: string | undefined
  size?: number
}

export function ProfileAvatar({ avatarUrl, displayName, email, color, size = 80 }: ProfileAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ?? email ?? ''}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: color ?? '#FF6B6B',
      }}
    >
      {getInitial(displayName, email)}
    </div>
  )
}
