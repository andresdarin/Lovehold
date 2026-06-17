'use client'

import { MapPin, Clock, Linkedin, Instagram, Link as LinkIcon, Smile, Calendar } from 'lucide-react'
import { ProfileAvatarFeature } from './ProfileAvatarFeature'
import { Trophy, Receipt, Clock as ClockIcon } from 'lucide-react'
import { formatMemberSince } from './utils'

interface ProfileIdentitySidebarProps {
  displayName: string | null
  email: string | undefined
  avatarUrl: string | null | undefined
  color: string | undefined
  createdAt: string | undefined
  onEdit: () => void
  onAvatarUpdate: (avatarUrl: string | null) => void
  unlockedAchievementsCount: number
}

/**
 * Identity sidebar inspired by GitHub's layout but styled
 * with Lovehold's dark premium glassmorphic system.
 */
export function ProfileIdentitySidebar({
  displayName,
  email,
  avatarUrl,
  color,
  createdAt,
  onEdit,
  onAvatarUpdate,
  unlockedAchievementsCount,
}: ProfileIdentitySidebarProps) {
  // Extract username from email
  const username = email ? email.split('@')[0] : 'usuario'

  return (
    <div className="flex flex-col gap-6 text-foreground">
      {/* Avatar Section with Status Overlay */}
      <div className="relative self-center lg:self-start">
        <ProfileAvatarFeature
          avatarUrl={avatarUrl}
          displayName={displayName}
          email={email}
          color={color}
          onAvatarUpdate={onAvatarUpdate}
        />
        
        {/* Status Bubble (GitHub style emoji badge) */}
        <div className="absolute bottom-4 right-4 bg-surface-soft/95 border border-border/80 rounded-full p-2 shadow-lg backdrop-blur-md flex items-center justify-center h-8 w-8 hover:scale-110 transition-transform duration-200 cursor-pointer" title="Trabajando duro">
          <Smile className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Identity Titles */}
      <div className="flex flex-col text-center lg:text-left">
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
          {displayName ?? 'Andrés Darín'}
        </h2>
        <p className="text-base text-muted-foreground/70 mt-0.5">
          {username}
        </p>
      </div>

      {/* Bio / Description */}
      <p className="text-sm text-foreground/90 leading-relaxed text-center lg:text-left font-medium">
        Passionate about technology, system analyst, guitarrist, gamer, coder
      </p>

      {/* Edit Profile Button */}
      <button
        onClick={onEdit}
        className="w-full py-2 px-4 rounded-lg bg-surface-soft/20 hover:bg-surface-soft/40 border border-border/50 text-sm font-semibold text-foreground transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        Edit profile
      </button>

      {/* Additional Metadata / Links */}
      <div className="flex flex-col gap-2.5 text-xs text-muted-foreground border-b border-border/20 pb-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span>Montevideo</span>
        </div>
        {createdAt && (
          <div className="flex items-center gap-2" title="Fecha de registro">
            <Calendar className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            <span>Miembro desde {formatMemberSince(createdAt)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span>11:46 <span className="text-muted-foreground/40">(UTC -03:00)</span></span>
        </div>
        <a href="https://www.linkedin.com/in/juanandressilvadarin/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Linkedin className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span className="truncate">juanandressilvadarin</span>
        </a>
        <a href="https://instagram.com/andresdarin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Instagram className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span className="truncate">andresdarin</span>
        </a>
        <a href="https://jasd-dev.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
          <LinkIcon className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span className="truncate">jasd-dev.com</span>
        </a>
      </div>

      {/* Achievements Section (Horizontal list) */}
      <div className="border-b border-border/20 pb-5">
        <h3 className="text-sm font-bold text-foreground mb-3">Achievements</h3>
        <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
          {/* Badge 1 */}
          <div className={`h-10 w-10 rounded-full border flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer shadow-md ${
            unlockedAchievementsCount >= 1
              ? 'border-primary/30 bg-primary/[0.08] text-primary shadow-primary/5'
              : 'border-border/30 bg-surface-soft/10 text-muted-foreground/60 opacity-40'
          }`} title="Primer movimiento: Registraste tu primer gasto.">
            <Trophy className="h-5 w-5" />
          </div>
          {/* Badge 2 */}
          <div className={`h-10 w-10 rounded-full border flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer shadow-md ${
            unlockedAchievementsCount >= 2
              ? 'border-primary/30 bg-primary/[0.08] text-primary shadow-primary/5'
              : 'border-border/30 bg-surface-soft/10 text-muted-foreground/60 opacity-40'
          }`} title="Primer ticket: Subiste tu primer ticket.">
            <Receipt className="h-5 w-5" />
          </div>
          {/* Badge 3 */}
          <div className={`h-10 w-10 rounded-full border flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer shadow-md ${
            unlockedAchievementsCount >= 3
              ? 'border-primary/30 bg-primary/[0.08] text-primary shadow-primary/5'
              : 'border-border/30 bg-surface-soft/10 text-muted-foreground/60 opacity-40'
          }`} title="Gastos fijos al día: Pagaste todos tus gastos recurrentes.">
            <ClockIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Organizations Section */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Organizations</h3>
        <div className="flex justify-center lg:justify-start">
          <div className="h-9 w-9 rounded-md border border-border/50 bg-surface-soft/10 flex items-center justify-center hover:border-primary/50 transition-colors duration-200 cursor-pointer" title="Lovehold Contribuidores">
            {/* Minimal cow SVG representation */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-1.5-4c-.83 0-1.5-.67-1.5-1.5V9c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
